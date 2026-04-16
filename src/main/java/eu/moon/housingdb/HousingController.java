package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingFlags;
import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTag;
import eu.moon.housingdb.domain.HousingWard;
import eu.moon.housingdb.dto.*;
import eu.moon.housingdb.repo.HousingPlotRepository;
import eu.moon.housingdb.repo.HousingWardRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
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
    private final HousingPlotRepository housingPlotRepository;
    private final EntityManager entityManager;

    @GetMapping("/world/{worldId}/territory/{territoryId}/wards/{wardNumber}")
    public HousingWard getHousingWard(@PathVariable("worldId") short worldId, @PathVariable("territoryId") short territoryId, @PathVariable("wardNumber") short wardNumber) {
        return housingWardRepository.findWard(worldId, territoryId, wardNumber);
    }

    @GetMapping("/available-data")
    public AvailableDataDto getAvailableData() {
        var worlds = entityManager.createQuery("select distinct new eu.moon.housingdb.dto.AvailableWorldDto(world.name, world.worldId) from HousingWorld world", AvailableWorldDto.class)
                .getResultList();
        var wards = entityManager.createQuery("select distinct new eu.moon.housingdb.dto.AvailableTerritoryDto(t.name, t.territoryId) from HousingTerritory t", AvailableTerritoryDto.class)
                .getResultList();
        return new AvailableDataDto(worlds, wards);
    }

    @PostMapping("/search")
    public SearchResultDto performSearch(@RequestBody SearchDto searchDto) {
        var result = housingPlotRepository.searchPlots(searchDto.getWorldId(),
                searchDto.getTerritoryId(),
                searchDto.getWardNumber(),
                searchDto.ownerQuery(),
                searchDto.greetingQuery(),
                searchDto.getTags(),
                !searchDto.getTags().isEmpty(),
                searchDto.isOnlyFilled(),
                PageRequest.of(searchDto.getPage(), searchDto.getPageSize())
        );
        return new SearchResultDto(result.get().toList(), result.getTotalElements());
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

            plot.setFlags(matchingDto.HouseMetaData().InfoFlags());
            plot.setOwned(HousingFlags.isOwned(matchingDto.HouseMetaData().InfoFlags()));
            plot.setBuilt(HousingFlags.isHouseBuilt(matchingDto.HouseMetaData().InfoFlags()));
            plot.setFreeCompany(HousingFlags.isOwnedByFc(matchingDto.HouseMetaData().InfoFlags()));
            plot.setVisitorsAllowed(HousingFlags.isVisitorsAllowed(matchingDto.HouseMetaData().InfoFlags()));

            plot.setEstateOwnerName(matchingDto.HouseMetaData().EstateOwnerName());
            plot.setLastUpdated(LocalDateTime.now());
            if (StringUtils.hasText(matchingDto.Greeting()) && !Objects.equals(matchingDto.Greeting(), plot.getGreeting())) {
                plot.setGreeting(matchingDto.Greeting());
                plot.setLastGreetingUpdated(LocalDateTime.now());
            }
        }
    }

    @PostMapping("/updated/{worldId}/{territoryId}/{wardNumber}/{plot}")
    public void updateGreeting(
            @PathVariable("worldId") short worldId,
            @PathVariable("territoryId") short territoryId,
            @PathVariable("wardNumber") short wardNumber,
            @PathVariable("plot") short plot,
            @RequestBody String newGreeting) {
        log.info("Receiving greeting update for {} - {} - {}/{}", worldId, territoryId, wardNumber, plot);
        // int WorldId, int TerritoryTypeId, int WardNumber, int PlotNumber
        housingPlotRepository.findPlot(worldId, territoryId, wardNumber, plot)
                .ifPresent(plot1 -> {
                    if (StringUtils.hasText(newGreeting) && !Objects.equals(newGreeting, plot1.getGreeting())) {
                        plot1.setGreeting(newGreeting);
                        plot1.setLastGreetingUpdated(LocalDateTime.now());
                    }
                    housingPlotRepository.save(plot1);
                });
    }
}
