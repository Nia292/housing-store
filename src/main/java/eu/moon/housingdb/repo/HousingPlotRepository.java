package eu.moon.housingdb.repo;

import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTag;
import eu.moon.housingdb.dto.SearchResultPlotDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface HousingPlotRepository extends JpaRepository<HousingPlot, Long> {
    @Query("""
        select plot from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
        where world.worldId = :world and territory.territoryId = :territory and ward.wardNumber = :wardNumber and plot.plotNumber = :plot
    """)
    Optional<HousingPlot> findPlot(int world, int territory, int wardNumber, int plot);

    @Query("""
        select new eu.moon.housingdb.dto.SearchResultPlotDto(world.name, territory.name, ward.wardNumber, plot) from HousingWorld world
            join world.territories territory
            join territory.wards ward
            join ward.plots plot
        where (:world is null or world.worldId = :world)
            and (:territoryId is null or territory.territoryId = :territoryId)
            and (:wardNumber is null or ward.wardNumber = :wardNumber)
            and (:estateOwner is null or lower(plot.estateOwnerName) like :estateOwner)
            and (:greeting is null or lower(plot.greeting) like :greeting)
            and (:onlyFilled = false or plot.lastUpdated is not null)
            and (:onlyOpen = false or plot.visitorsAllowed = true)
            and (:onlyWithGreeting = false or plot.greeting is not null or plot.greeting <> '')
            and (:searchTags = false or plot.tagA in :tags or plot.tagB in :tags or plot.tagC in :tags)
        order by world.name, territory.name, ward.wardNumber, plot.plotNumber
        """)
    Page<SearchResultPlotDto> searchPlots(Integer world, Integer territoryId, Integer wardNumber, String estateOwner, String greeting, Set<HousingTag> tags,
                                          boolean searchTags, boolean onlyFilled, boolean onlyOpen, boolean onlyWithGreeting,
                                          Pageable pageable);
}
