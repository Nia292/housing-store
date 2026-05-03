package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTerritory;
import eu.moon.housingdb.domain.HousingWard;
import eu.moon.housingdb.domain.HousingWorld;
import eu.moon.housingdb.repo.HousingWorldRepository;
import eu.moon.housingdb.search.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@Slf4j
@RequiredArgsConstructor
@EnableScheduling
@EnableAsync
public class HousingdbApplication implements InitializingBean {

    private final HousingWorldRepository housingWorldRepository;
    private final SearchService searchService;
    private final HousingUpdater housingUpdater;

    public static void main(String[] args) {
        SpringApplication.run(HousingdbApplication.class, args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        var lines = new InputStreamReader(getClass().getClassLoader().getResourceAsStream("./worlds.csv")).readAllLines();
        lines.stream()
                .skip(1)
                .forEach(line -> {
                    var split = line.split(",");
                    var id = Integer.valueOf(split[0]);
                    var name = split[1];
                    var dataCenter = Integer.valueOf(split[3]);
                    var isPublic = split[6].equals("True");
                    if (isPublic) {
                        initializeWorldIfNeeded(name, id, dataCenter);
                        addDataCenterIfNeeded(id, dataCenter);
                    }
                });
        searchService.buildIndex();
        housingUpdater.migrateGreetingFlag();
    }

    private void addDataCenterIfNeeded(int id, int dataCenterId) {
        HousingWorld world = housingWorldRepository.getByWorldId(id);
        if (world.getDataCenterId() == null) {
            world.setDataCenterId(dataCenterId);
            housingWorldRepository.save(world);
        }
    }

    private void initializeWorldIfNeeded(String worldName, int worldId, int dataCenterId) {
        if (!housingWorldRepository.existsByWorldId(worldId)) {
            log.info("Failed to find world {}, initializing", worldName);
            var world = new HousingWorld();
            world.setName(worldName);
            world.setDataCenterId(dataCenterId);
            world.setWorldId(worldId);
            world.setTerritories(List.of(
                    createHousingTerritory("The Goblet", 341),
                    createHousingTerritory("The Lavender Beds", 340),
                    createHousingTerritory("Mist", 339),
                    createHousingTerritory("Empyreum", 979),
                    createHousingTerritory("Shirogane", 641)
            ));
            housingWorldRepository.save(world);
        }
    }

    private HousingTerritory createHousingTerritory(String name, int territoryId) {
        var territory = new HousingTerritory();
        territory.setName(name);
        territory.setTerritoryId(territoryId);
        territory.setWards(new ArrayList<>());
        for (int i = 0; i < 30; i++) {
            var ward = new HousingWard();
            ward.setWardNumber(i);
            ward.setPlots(new ArrayList<>());
            for (int j = 1; j <= 60; j++) {
                HousingPlot plot = new HousingPlot();
                plot.setPlotNumber(j);
                ward.getPlots().add(plot);
            }
            territory.getWards().add(ward);
        }
        return territory;
    }
}
