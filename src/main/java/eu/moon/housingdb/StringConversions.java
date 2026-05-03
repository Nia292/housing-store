package eu.moon.housingdb;

import eu.moon.housingdb.dto.MissingData;

import java.util.List;
import java.util.stream.Collectors;

public class StringConversions {

    public static String stringify(List<MissingData> missingWards) {
        if (missingWards.size() >= 30) {
            return "all";
        }
        return missingWards.stream().map(MissingData::wardNumber).sorted().map(String::valueOf).collect(Collectors.joining(","));
    }

    public static String getDcName(int dataCenterId) {
        return switch (dataCenterId) {
            case 1 -> "[JP] Elemental";
            case 2 -> "[JP] Gaia";
            case 3 -> "[JP] Mana";
            case 4 -> "[NA] Aether";
            case 5 -> "[NA] Primal";
            case 6 -> "[EU] Chaos";
            case 7 -> "[EU] Light";
            case 8 -> "[NA] Crystal";
            case 9 -> "[OCE] Materia";
            case 10 -> "[JP] Meteor";
            case 11 -> "[NA] Dynamis";
            case 13 -> "Cloud Test";
            default -> String.valueOf(dataCenterId);
        };
    }
}
