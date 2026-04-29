package eu.moon.housingdb.repo;

import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.dto.SearchResultPlotDto;
import eu.moon.housingdb.search.SearchablePlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface HousingPlotRepository extends JpaRepository<HousingPlot, Long> {

    @Query("""
        select plot from HousingPlot plot where plot.hasGreeting is null and plot.flags > 0 and plot.lastUpdated is not null
    """)
    Page<HousingPlot> findForGreetingFlag(Pageable pageable);

    @Query("""
        select plot from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
        where world.worldId = :world and territory.territoryId = :territory and ward.wardNumber = :wardNumber and plot.plotNumber = :plot
    """)
    Optional<HousingPlot> findPlot(int world, int territory, int wardNumber, int plot);

    @Query("""
        select new eu.moon.housingdb.dto.SearchResultPlotDto(world.name, world.worldId, territory.name, territory.territoryId, ward.wardNumber, plot) from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
        where (plot.id in :ids)
        """)
    List<SearchResultPlotDto> getDTOsByIDs(List<Long> ids);

    @Query("""
        select new eu.moon.housingdb.search.SearchablePlot(
                plot.id, world.worldId, world.name, territory.territoryId, territory.name,
                 ward.wardNumber, plot.plotNumber, plot.estateOwnerName, plot.greeting, plot.visitorsAllowed, plot.lastUpdated,
                 plot.tagA, plot.tagB, plot.tagC
         )
         from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
        """)
    Stream<SearchablePlot> getAllForIndex();

    @Query("""
        select new eu.moon.housingdb.search.SearchablePlot(
                plot.id, world.worldId, world.name, territory.territoryId, territory.name,
                 ward.wardNumber, plot.plotNumber, plot.estateOwnerName, plot.greeting, plot.visitorsAllowed, plot.lastUpdated,
                 plot.tagA, plot.tagB, plot.tagC
         )
         from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
         where plot.id = :id
        """)
    SearchablePlot getOneForIndex(Long id);

    @Query("""
        select new eu.moon.housingdb.search.SearchablePlot(
                plot.id, world.worldId, world.name, territory.territoryId, territory.name,
                 ward.wardNumber, plot.plotNumber, plot.estateOwnerName, plot.greeting, plot.visitorsAllowed, plot.lastUpdated,
                 plot.tagA, plot.tagB, plot.tagC
         )
         from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
        where (plot.id in :ids)
        """)
    List<SearchablePlot> getManyForIndex(List<Long> ids);
}
