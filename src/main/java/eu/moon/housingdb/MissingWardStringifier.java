package eu.moon.housingdb;

import eu.moon.housingdb.dto.MissingData;

import java.util.List;
import java.util.stream.Collectors;

public class MissingWardStringifier {

    public static String stringify(List<MissingData> missingWards) {
        if (missingWards.size() >= 30) {
            return "all";
        }
        return missingWards.stream().map(MissingData::wardNumber).sorted().map(String::valueOf).collect(Collectors.joining(","));
    }
}
