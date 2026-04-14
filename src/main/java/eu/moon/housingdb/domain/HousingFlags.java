package eu.moon.housingdb.domain;

public enum HousingFlags {
    PlotOwned,
    VisitorsAllowed,
    HasSearchComment,
    HouseBuilt,
    OwnedByFC,
    UNKNOWN
    ;

    public static HousingFlags ofXivOrdinal(int value) {
        if (value == 1 << 0) {
            return PlotOwned;
        }
        if (value == 1 << 1) {
            return VisitorsAllowed;
        }
        if (value == 1 << 3) {
            return HasSearchComment;
        }
        if (value == 1 << 4) {
            return HouseBuilt;
        }
        if (value == 1 << 5) {
            return OwnedByFC;
        }
        return UNKNOWN;
    }
}

