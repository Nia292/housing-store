package eu.moon.housingdb;

import eu.moon.housingdb.domain.Favorite;
import eu.moon.housingdb.dto.*;
import eu.moon.housingdb.repo.FavoritesRepository;
import eu.moon.housingdb.repo.HousingPlotRepository;
import eu.moon.housingdb.search.SearchService;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("api")
@RequiredArgsConstructor
public class HousingController {
    private final HousingPlotRepository housingPlotRepository;
    private final FavoritesRepository favoriteRepository;
    private final EntityManager entityManager;
    private final SearchService searchService;
    private final HousingUpdater housingUpdater;

    @GetMapping("/missing-data")
    public List<MissingDataDto> getMissingData() {
        return housingPlotRepository.getMissingData()
                .stream()
                .collect(Collectors.groupingBy(MissingData::territoryId))
                .values()
                .stream()
                .map(missingWards -> {
                    var first = missingWards.getFirst();

                    return new MissingDataDto(
                            first.worldName(),
                            first.territoryName(),
                            StringConversions.stringify(missingWards)
                    );
                })
                .toList();
    }

    @GetMapping("/available-data")
    public AvailableDataDto getAvailableData() {
        var dataCenters = entityManager.createQuery("select distinct new eu.moon.housingdb.dto.AvailableWorldDto(world.name, world.worldId, world.dataCenterId) from HousingWorld world", AvailableWorldDto.class)
                .getResultList()
                .stream()
                .collect(Collectors.groupingBy(AvailableWorldDto::dataCenterId))
                .entrySet()
                .stream()
                .map(integerListEntry -> {
                    var dcId = integerListEntry.getKey();
                    var worldsSorted = integerListEntry.getValue()
                            .stream()
                            .sorted(Comparator.comparing(AvailableWorldDto::name))
                            .toList();
                    return new AvailableDataCenterDto(StringConversions.getDcName(dcId),worldsSorted );
                })
                .toList();

        var wards = entityManager.createQuery("select distinct new eu.moon.housingdb.dto.AvailableTerritoryDto(t.name, t.territoryId) from HousingTerritory t", AvailableTerritoryDto.class)
                .getResultList();
        return new AvailableDataDto(dataCenters, wards);
    }

    @PostMapping("/search")
    public SearchResultDto performSearch(@RequestBody SearchDto searchDto) {
        return searchService.search(searchDto);
    }


    @PostMapping("/update")
    @Transactional
    public void updateEntries(@RequestBody List<HousingUpdateDto> content) {
        if (content.isEmpty()) return;
        var idsToUpdate = housingUpdater.updatePlots(content);
        searchService.addToIndex(idsToUpdate);
    }

    @PostMapping("/updated/{worldId}/{territoryId}/{wardNumber}/{plot}")
    public void updateGreeting(
            @PathVariable("worldId") short worldId,
            @PathVariable("territoryId") short territoryId,
            @PathVariable("wardNumber") short wardNumber,
            @PathVariable("plot") short plot,
            @RequestBody String newGreeting) {
        log.info("Receiving greeting update for {} - {} - {}/{}", worldId, territoryId, wardNumber, plot);
        housingUpdater.updateGreeting(worldId, territoryId, wardNumber, plot, newGreeting)
                .ifPresent(searchService::addToIndex);
    }

    @Transactional
    @PostMapping("/favorite/{worldId}/{territoryId}/{wardNumber}/{plot}/{isFavorite}")
    public void setFavorite(@PathVariable("worldId") short worldId,
                            @PathVariable("territoryId") short territoryId,
                            @PathVariable("wardNumber") short wardNumber,
                            @PathVariable("plot") short plot,
                            @PathVariable("isFavorite") boolean isFavorite) {
        var username = getCurrentUserName();
        housingPlotRepository.findPlot(worldId, territoryId, wardNumber, plot)
                .ifPresent(housingPlot -> {
                    if (isFavorite) {
                        var fav = new Favorite();
                        fav.setPlot(housingPlot);
                        fav.setUsername(username);
                        favoriteRepository.save(fav);
                    } else {
                        favoriteRepository.deleteByPlotAndUsername(housingPlot, username);
                    }
                });
    }

    @GetMapping("/favorites")
    public List<Long> getFavoritePlotIds() {
        var username = getCurrentUserName();
        return favoriteRepository.findIdsByUsername(username);
    }

    @GetMapping("/search-suggestions")
    public List<String> getTopSuggestions(@RequestParam("search") String search) {
        if (search.isBlank()) {
            return Collections.emptyList();
        }
        return searchService.fuzzySuggestions(search);
    }

    private String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
