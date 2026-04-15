package eu.moon.housingdb.dto;

import lombok.Data;

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

    public String ownerQuery() {
        if (owner == null || owner.trim().isBlank()) {
            return null;
        }
        return "%" + owner + "%";
    }

    public String greetingQuery() {
        if (greeting == null || greeting.trim().isBlank()) {
            return null;
        }
        return "%" + greeting + "%";
    }
}
