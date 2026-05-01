package eu.moon.housingdb.dto;

import eu.moon.housingdb.domain.HousingTag;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class SearchDto {
    private Integer worldId;
    private Integer territoryId;
    private int page;
    private int pageSize;
    private Set<HousingTag> tags;
    private List<String> searchKeys;
    private boolean matchConjunctive;
}
