package eu.moon.housingdb.repo;

import eu.moon.housingdb.domain.Favorite;
import eu.moon.housingdb.domain.HousingPlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoritesRepository extends JpaRepository<Favorite, Integer> {

    void deleteByPlotAndUsername(HousingPlot plot, String username);

    @Query("select plot.id from Favorite fav join fav.plot plot where fav.username = :username")
    List<Long> findIdsByUsername(String username);
}
