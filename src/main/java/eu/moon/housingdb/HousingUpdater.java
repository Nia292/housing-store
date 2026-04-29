package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingFlags;
import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTag;
import eu.moon.housingdb.dto.HousingUpdateDto;
import eu.moon.housingdb.repo.HousingPlotRepository;
import eu.moon.housingdb.repo.HousingWardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HousingUpdater {
    private final HousingWardRepository housingWardRepository;
    private final HousingPlotRepository housingPlotRepository;

    @Transactional
    public List<Long> updatePlots(List<HousingUpdateDto> content) {
        var houseId = content.getFirst().HouseId();
        log.info("Receiving update for {} - {} - {}", houseId.WorldId(), houseId.TerritoryTypeId(), houseId.WardNumber());
        var wardToUpdate = housingWardRepository.findWard(houseId.WorldId(), houseId.TerritoryTypeId(), houseId.WardNumber());
        return wardToUpdate.getPlots()
                .stream()
                .map(plot -> {
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
                    plot.setHasGreeting(HousingFlags.isHasGreeting(matchingDto.HouseMetaData().InfoFlags()));
                    plot.setFreeCompany(HousingFlags.isOwnedByFc(matchingDto.HouseMetaData().InfoFlags()));
                    plot.setVisitorsAllowed(HousingFlags.isVisitorsAllowed(matchingDto.HouseMetaData().InfoFlags()));

                    plot.setEstateOwnerName(matchingDto.HouseMetaData().EstateOwnerName());
                    plot.setLastUpdated(LocalDateTime.now());
                    if (StringUtils.hasText(matchingDto.Greeting()) && !Objects.equals(matchingDto.Greeting(), plot.getGreeting())) {
                        plot.setGreeting(matchingDto.Greeting());
                        plot.setLastGreetingUpdated(LocalDateTime.now());
                    }
                    return plot.getId();
                })
                .toList();
    }

    @Transactional
    public Optional<Long> updateGreeting(
            short worldId,
            short territoryId,
            short wardNumber,
            short plot,
            String newGreeting) {

        return housingPlotRepository.findPlot(worldId, territoryId, wardNumber, plot)
                .map(plot1 -> {
                    if (!Objects.equals(newGreeting, plot1.getGreeting())) {
                        plot1.setGreeting(newGreeting);
                        plot1.setLastGreetingUpdated(LocalDateTime.now());
                        housingPlotRepository.save(plot1);
                        return plot1.getId();
                    }
                    return null;
                });
    }

    @Async
    @Transactional
    public void migrateGreetingFlag() {
        var toUpdate = housingPlotRepository.findForGreetingFlag(Pageable.ofSize(10_000));
        var plots = toUpdate.toList();
        if (!plots.isEmpty()) {
            log.info("Adding 'hasGreeting' flag to documents {} missing it", plots.size());
            for (HousingPlot plot : plots) {
                plot.setHasGreeting(HousingFlags.isHasGreeting(plot.getFlags()));
            }
            if (plots.size() >= 10_000) {
                migrateGreetingFlag();
            }
        }
    }
}
