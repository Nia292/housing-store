package eu.moon.housingdb.dto;

import eu.moon.housingdb.domain.HousingPlot;

public record SearchResultDto(String worldName, String territoryName, int ward, HousingPlot plot) {
}
