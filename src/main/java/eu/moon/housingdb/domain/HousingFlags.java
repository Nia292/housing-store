package eu.moon.housingdb.domain;

public class HousingFlags {

    public static boolean isOwned(short value) {
        return (value & 1 << 0) != 0;
    }

    public static boolean isVisitorsAllowed(short value) {
        return (value & 1 << 1) != 0;
    }

    public static boolean isHouseBuilt(short value) {
        return (value & 1 << 3) != 0;
    }

    public static boolean isOwnedByFc(short value) {
        return (value & 1 << 4) != 0;
    }
}

