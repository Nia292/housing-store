package eu.moon.housingdb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.moon.housingdb.domain.HousingPlot;

public record SearchResultPlotDto(String worldName, int worldId, String territoryName, int territoryId, int ward, HousingPlot plot) {

    @JsonProperty("key")
    public String getKey() {
        return worldId + "." + territoryId + "." + ward + "." + plot.getPlotNumber();
    }
}
