package eu.moon.housingdb.dto;

import java.util.List;

public record AvailableDataCenterDto(String name, List<AvailableWorldDto> worlds) {
}
