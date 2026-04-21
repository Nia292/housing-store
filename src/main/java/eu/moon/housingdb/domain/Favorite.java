package eu.moon.housingdb.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "plot_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private HousingPlot plot;

    private String username;
}
