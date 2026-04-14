package eu.moon.housingdb.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "xiv_world")
@Data
public class HousingWorld {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "world_name", length = 100)
    private String name;

    @Column(name = "world_id")
    private int worldId;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "world_id")
    private List<HousingTerritory> territories;
}
