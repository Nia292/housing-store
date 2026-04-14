package eu.moon.housingdb;

import eu.moon.housingdb.domain.HousingPlot;
import eu.moon.housingdb.domain.HousingTerritory;
import eu.moon.housingdb.domain.HousingWard;
import eu.moon.housingdb.domain.HousingWorld;
import eu.moon.housingdb.repo.HousingWorldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@Slf4j
@RequiredArgsConstructor
public class HousingdbApplication implements InitializingBean {

    private final HousingWorldRepository housingWorldRepository;

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
                    var isPublic = split[6].equals("True");
                    if (isPublic) {
                        initializeWorldIfNeeded(name, id);
                    }
                });
    }

    private void initializeWorldIfNeeded(String worldName, int worldId) {
        if (!housingWorldRepository.existsByWorldId(worldId)) {
            log.info("Failed to find world {}, initializing", worldName);
            var world = new HousingWorld();
            world.setName(worldName);
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
            for (int j = 1; j < 60; j++) {
                HousingPlot plot = new HousingPlot();
                plot.setPlotNumber(j);
                ward.getPlots().add(plot);
            }
            territory.getWards().add(ward);
        }
        return territory;
    }
}
