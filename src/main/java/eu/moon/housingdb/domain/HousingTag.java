package eu.moon.housingdb.domain;

public enum HousingTag {
    None,
    Emporium,
    Boutique,
    DesignerHome,
    MessageBook,
    Tavern,
    Eatery,
    ImmersiveExperience,
    Cafe,
    Aquarium,
    Sanctuary,
    Venue,
    Florist,
    Unknown13,
    Library,
    PhotoStudio,
    HauntedHouse,
    Atelier,
    Bathhouse,
    Garden,
    FarEastern,
    VisitorsWelcome,
    UnderConstruction,
    Bakery,
    ConcertHall,
    Unknown25,
    Unknown26,
    Unknown27,
    Unknown28,
    Unknown29,
    Unknown30;

    public static HousingTag fromOrdinal(Integer val) {
        if (val == null) return None;
        return HousingTag.values()[val];
    }
}
