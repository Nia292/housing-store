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
    private boolean isOpen;
    private int page;
    private int pageSize;
    private boolean onlyFilled;
    private Set<HousingTag> tags;

    public String ownerQuery() {
        if (owner == null || owner.trim().isBlank()) {
            return null;
        }
        return "%" + owner.toLowerCase() + "%";
    }

    public String greetingQuery() {
        if (greeting == null || greeting.trim().isBlank()) {
            return null;
        }
        return "%" + greeting.toLowerCase() + "%";
    }
}
