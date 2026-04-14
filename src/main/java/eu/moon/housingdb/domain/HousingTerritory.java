package eu.moon.housingdb.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "xiv_territory")
@Data
public class HousingTerritory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "territory_name", length = 100)
    private String name;

    @Column(name = "territory_id")
    private int territoryId;

    @JoinColumn(name = "territory_id")
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<HousingWard> wards;
}
