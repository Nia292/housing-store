package eu.moon.housingdb.repo;

import eu.moon.housingdb.domain.HousingWorld;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HousingWorldRepository extends JpaRepository<HousingWorld, Long> {

    boolean existsByWorldId(int worldId);
}
