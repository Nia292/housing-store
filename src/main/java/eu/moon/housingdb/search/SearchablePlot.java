package eu.moon.housingdb.search;

import eu.moon.housingdb.domain.HousingTag;
import lombok.Data;
import org.hibernate.search.engine.backend.types.Projectable;
import org.hibernate.search.engine.backend.types.Sortable;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.*;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Data
@SearchEntity
@Indexed
public class SearchablePlot {
    @DocumentId
    private Long id;
    @GenericField
    private Integer worldId;
    @GenericField(sortable = Sortable.YES)
    private String worldName;
    @GenericField
    private Integer territoryId;
    @GenericField(sortable = Sortable.YES)
    private String territoryName;
    @GenericField(sortable = Sortable.YES)
    private Integer wardNumber;
    @GenericField(sortable = Sortable.YES)
    private Integer plotNumber;
    @FullTextField
    private String owner;
    @FullTextField(projectable = Projectable.YES)
    private String greeting;
    @GenericField
    private boolean open;
    @GenericField
    private boolean hasGreetingFlag;
    @GenericField
    private LocalDateTime lastUpdate;
    @GenericField
    private HousingTag tagA;
    @GenericField
    private HousingTag tagB;
    @GenericField
    private HousingTag tagC;

    public SearchablePlot(Long id, Integer worldId, String worldName, Integer territoryId, String territoryName, Integer wardNumber, Integer plotNumber, String owner, String greeting, boolean open, Boolean hasGreetingFlag, LocalDateTime lastUpdate, HousingTag tagA, HousingTag tagB, HousingTag tagC) {
        this.id = id;
        this.worldId = worldId;
        this.worldName = worldName;
        this.territoryId = territoryId;
        this.territoryName = territoryName;
        this.wardNumber = wardNumber;
        this.plotNumber = plotNumber;
        this.owner = owner;
        this.greeting = StringUtils.hasText(greeting) ? greeting : null;
        this.open = open;
        this.hasGreetingFlag = hasGreetingFlag != null && hasGreetingFlag;
        this.lastUpdate = lastUpdate;
        this.tagA = tagA;
        this.tagB = tagB;
        this.tagC = tagC;
    }
}
