package eu.moon.housingdb.dto;

import java.util.List;

public record SearchResultDto(List<SearchResultPlotDto> plots, long totalElementCount) {


}
