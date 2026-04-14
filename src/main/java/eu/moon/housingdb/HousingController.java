package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingFlags;
import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTag;
import eu.moon.housingdb.domain.HousingWard;
import eu.moon.housingdb.dto.HousingUpdateDto;
import eu.moon.housingdb.repo.HousingWardRepository;
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
@RequiredArgsConstructor
public class HousingController {
    private final HousingWardRepository housingWardRepository;

    @GetMapping("/world/{worldId}/territory/{territoryId}/wards/{wardNumber}")
    public HousingWard getHousingWard(@PathVariable("worldId") short worldId, @PathVariable("territoryId") short territoryId, @PathVariable("wardNumber") short wardNumber) {
        return housingWardRepository.findWard(worldId, territoryId, wardNumber);
    }

    @PostMapping("/update")
    @Transactional
    public void updateEntries(@RequestBody List<HousingUpdateDto> content) {
        log.info(content.toString());
        if (content.isEmpty()) return;
        var houseId = content.getFirst().HouseId();
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
