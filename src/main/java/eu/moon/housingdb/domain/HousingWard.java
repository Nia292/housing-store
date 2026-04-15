package eu.moon.housingdb.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "xiv_ward", indexes = {@Index(name = "idx_ward_number", columnList = "ward_number")})
@Data
public class HousingWard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ward_number")
    private int wardNumber;

    @JoinColumn(name = "ward_id")
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<HousingPlot> plots;
}
