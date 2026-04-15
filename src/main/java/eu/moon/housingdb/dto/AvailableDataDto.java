package eu.moon.housingdb.dto;

import java.util.List;

public record AvailableDataDto(List<AvailableWorldDto> worlds, List<AvailableTerritoryDto> territories) {

}
