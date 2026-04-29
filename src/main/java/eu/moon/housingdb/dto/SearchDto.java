package eu.moon.housingdb.dto;

import eu.moon.housingdb.domain.HousingTag;
import lombok.Data;

import java.util.Set;

@Data
public class SearchDto {
    private Integer worldId;
    private Integer territoryId;
    private Integer wardNumber;
    private String owner;
    private String greeting;
    private int page;
    private int pageSize;
    private boolean onlyFilled;
    private boolean onlyOpen;
    private boolean onlyWithGreeting;
    private Set<HousingTag> tags;
}
