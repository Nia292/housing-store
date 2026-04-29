package eu.moon.housingdb.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "xiv_plot", indexes = {@Index(name = "idx_search", columnList = "estate_owner_name, greeting")})
public class HousingPlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plot_number")
    private int plotNumber;

    @Column(name = "estate_owner_name")
    private String estateOwnerName;

    @Column(name = "tag_a")
    @Enumerated(EnumType.STRING)
    private HousingTag tagA;

    @Column(name = "tag_b")
    @Enumerated(EnumType.STRING)
    private HousingTag tagB;

    @Column(name = "tag_c")
    @Enumerated(EnumType.STRING)
    private HousingTag tagC;

    @Column(name = "flags")
    private short flags;

    @Column(name = "is_owned")
    private boolean isOwned;

    @Column(name = "visitors_allowed")
    private boolean visitorsAllowed;

    @Column(name = "is_built")
    private boolean isBuilt;

    @Column(name = "is_free_company")
    private boolean isFreeCompany;

    // If the housing flags ("flags") have the "has greeting" bit set
    @Column(name = "has_greeting")
    private Boolean hasGreeting;

    @Column(name = "greeting")
    private String greeting;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "last_greeting_updated")
    private LocalDateTime lastGreetingUpdated;
}
