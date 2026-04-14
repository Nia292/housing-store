package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingPlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HousingEntryRepository extends JpaRepository<HousingPlot, Long> {
}
