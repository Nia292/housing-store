package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingFlags;
import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTag;
import eu.moon.housingdb.domain.HousingWard;
import eu.moon.housingdb.dto.*;
import eu.moon.housingdb.repo.HousingWardRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@RestController
@RequestMapping("api")
@RequiredArgsConstructor
public class HousingController {
    private final HousingWardRepository housingWardRepository;
    private final EntityManager entityManager;

    @GetMapping("/world/{worldId}/territory/{territoryId}/wards/{wardNumber}")
    public HousingWard getHousingWard(@PathVariable("worldId") short worldId, @PathVariable("territoryId") short territoryId, @PathVariable("wardNumber") short wardNumber) {
        return housingWardRepository.findWard(worldId, territoryId, wardNumber);
    }

    @GetMapping("/available-data")
    public AvailableDataDto getAvailableData() {
        var worlds = entityManager.createQuery("select distinct new eu.moon.housingdb.dto.AvailableWorldDto(world.name, world.worldId) from HousingWorld world", AvailableWorldDto.class)
                .getResultList();
        var wards =  entityManager.createQuery("select distinct new eu.moon.housingdb.dto.AvailableTerritoryDto(t.name, t.territoryId) from HousingTerritory t", AvailableTerritoryDto.class)
                .getResultList();
        return new AvailableDataDto(worlds, wards);
    }

    @PostMapping("/search")
    public List<SearchResultDto> performSearch(@RequestBody SearchDto searchDto) {
        return entityManager.createQuery("""
            select new eu.moon.housingdb.dto.SearchResultDto(world.name, territory.name, ward.wardNumber, plot) from HousingWorld world
                join world.territories territory
                join territory.wards ward
                join ward.plots plot
            where (:world is null or world.worldId = :world)
                and (:territoryId is null or territory.territoryId = :territoryId)
                and (:wardNumber is null or ward.wardNumber = :wardNumber)
                and (:estateOwner is null or plot.estateOwnerName like :estateOwner)
                and (:greeting is null or plot.greeting like :greeting)
            order by world.name, territory.name, ward.wardNumber, plot.plotNumber
            limit :limit
            offset :offset
        """, SearchResultDto.class)
                .setParameter("world", searchDto.getWorldId())
                .setParameter("territoryId", searchDto.getTerritoryId())
                .setParameter("wardNumber", searchDto.getWardNumber())
                .setParameter("estateOwner", searchDto.ownerQuery())
                .setParameter("greeting", searchDto.greetingQuery())
                .setParameter("limit", searchDto.getPageSize())
                .setParameter("offset", searchDto.getPage() * searchDto.getPageSize())
                .getResultList();
    }


    @PostMapping("/update")
    @Transactional
    public void updateEntries(@RequestBody List<HousingUpdateDto> content) {
        if (content.isEmpty()) return;
        var houseId = content.getFirst().HouseId();
        log.info("Receiving update for {} - {} - {}", houseId.WorldId(), houseId.TerritoryTypeId(), houseId.WardNumber());
        var wardToUpdate = housingWardRepository.findWard(houseId.WorldId(), houseId.TerritoryTypeId(), houseId.WardNumber());
        for (HousingPlot plot : wardToUpdate.getPlots()) {
            var matchingDto = content.stream().filter(dto -> dto.HouseId().PlotNumber() == plot.getPlotNumber()).findFirst().orElseThrow();
            var tagA = HousingTag.fromOrdinal(matchingDto.HouseMetaData().TagA());
            var tagB = HousingTag.fromOrdinal(matchingDto.HouseMetaData().TagB());
            var tagC = HousingTag.fromOrdinal(matchingDto.HouseMetaData().TagC());

            plot.setTagA(tagA);
            plot.setTagB(tagB);
            plot.setTagC(tagC);
            plot.setEstateOwnerName(matchingDto.HouseMetaData().EstateOwnerName());
            plot.setLastUpdated(LocalDateTime.now());
            plot.setFlags(HousingFlags.ofXivOrdinal(matchingDto.HouseMetaData().InfoFlags()));
            if (StringUtils.hasText(matchingDto.Greeting()) && !Objects.equals(matchingDto.Greeting(), plot.getGreeting())) {
                plot.setGreeting(matchingDto.Greeting());
                plot.setLastGreetingUpdated(LocalDateTime.now());
            }
        }
    }
}
