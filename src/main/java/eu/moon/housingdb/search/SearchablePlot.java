package eu.moon.housingdb.search;

import eu.moon.housingdb.domain.HousingTag;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.search.engine.backend.types.Sortable;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.*;

import java.time.LocalDateTime;

@Data
@SearchEntity
@Indexed
@AllArgsConstructor
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
    @FullTextField
    private String greeting;
    @GenericField
    private boolean open;
    @GenericField
    private LocalDateTime lastUpdate;
    @GenericField
    private HousingTag tagA;
    @GenericField
    private HousingTag tagB;
    @GenericField
    private HousingTag tagC;

}
