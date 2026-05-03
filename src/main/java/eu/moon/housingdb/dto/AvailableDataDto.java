package eu.moon.housingdb.dto;

import java.util.List;

public record AvailableDataDto(List<AvailableDataCenterDto> dataCenters, List<AvailableTerritoryDto> territories) {

}
