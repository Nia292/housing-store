package eu.moon.housingdb.feature.favorite;

import eu.moon.housingdb.domain.Favorite;
import eu.moon.housingdb.dto.SearchResultPlotDto;
import eu.moon.housingdb.repo.FavoritesRepository;
import eu.moon.housingdb.repo.HousingPlotRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/favorite")
@RequiredArgsConstructor
public class FavoriteController {

    private final HousingPlotRepository housingPlotRepository;
    private final FavoritesRepository favoritesRepository;

    @Transactional
    @PostMapping("/{worldId}/{territoryId}/{wardNumber}/{plot}")
    public void setFavorite(@PathVariable("worldId") short worldId,
                            @PathVariable("territoryId") short territoryId,
                            @PathVariable("wardNumber") short wardNumber,
                            @PathVariable("plot") short plot,
                            @RequestBody(required = false) String comment) {
        var username = getCurrentUserName();
        housingPlotRepository.findPlot(worldId, territoryId, wardNumber, plot)
                .ifPresent(housingPlot -> {
                    if (favoritesRepository.getFavoriteByPlotAndUsername(housingPlot, username).isEmpty()) {
                        var fav = new Favorite();
                        fav.setPlot(housingPlot);
                        fav.setUsername(username);
                        fav.setComment(comment);
                        favoritesRepository.save(fav);
                    }
                });
    }

    @Transactional
    @DeleteMapping("/{worldId}/{territoryId}/{wardNumber}/{plot}")
    public void removeFavorite(@PathVariable("worldId") short worldId,
                               @PathVariable("territoryId") short territoryId,
                               @PathVariable("wardNumber") short wardNumber,
                               @PathVariable("plot") short plot) {
        var username = getCurrentUserName();
        housingPlotRepository
                .findPlot(worldId, territoryId, wardNumber, plot)
                .ifPresent(housingPlot -> favoritesRepository.deleteByPlotAndUsername(housingPlot, username));
    }

    @Transactional
    @PostMapping("/{worldId}/{territoryId}/{wardNumber}/{plot}/comment")
    public void setFavoriteComment(@PathVariable("worldId") short worldId,
                                   @PathVariable("territoryId") short territoryId,
                                   @PathVariable("wardNumber") short wardNumber,
                                   @PathVariable("plot") short plot,
                                   @RequestBody String comment) {
        var username = getCurrentUserName();
        var plotEntity = housingPlotRepository.findPlot(worldId, territoryId, wardNumber, plot).orElseThrow();
        favoritesRepository.getFavoriteByPlotAndUsername(plotEntity, username)
                .ifPresent(favorite -> {
                    favorite.setComment(comment);
                    favoritesRepository.save(favorite);
                });
    }

    @GetMapping("/plot-ids")
    public List<Long> getFavoritePlotIds() {
        var username = getCurrentUserName();
        return favoritesRepository.findIdsByUsername(username);
    }

    @GetMapping("/plots")
    public List<SearchResultPlotDto> getFavoritePlots() {
        List<Long> favoritePlotIds = getFavoritePlotIds();
        var username = getCurrentUserName();
        return housingPlotRepository.getDTOsByIDs(favoritePlotIds, username);
    }

    private String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
