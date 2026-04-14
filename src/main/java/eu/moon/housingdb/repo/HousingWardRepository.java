package eu.moon.housingdb.repo;

import eu.moon.housingdb.domain.HousingWard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HousingWardRepository extends JpaRepository<HousingWard, Long> {
    @Query("""
        select ward from HousingWorld world
            join world.territories territory
            join territory.wards ward
        where world.worldId = ?1 and territory.territoryId = ?2 and ward.wardNumber = ?3
    """)
    HousingWard findWard(int world, int territory, int wardNumber);
}
