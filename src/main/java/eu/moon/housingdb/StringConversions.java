package eu.moon.housingdb;

import eu.moon.housingdb.dto.MissingData;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class StringConversions {

    public static String stringify(List<MissingData> missingWards) {
        if (missingWards.size() >= 30) {
            return "all";
        }
        return missingWards.stream()
                .map(MissingData::wardNumber)
                .sorted()
                .map(ward -> new Moogle(ward + 1, ward + 1, new ArrayList<>()))
                .reduce(Moogle::merge)
                .map(Moogle::toFinalString)
                .orElse("");
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

    @AllArgsConstructor
    private static class Moogle {
        public int start;
        public int end;

        public List<String> mogpoms;

        public static Moogle merge(Moogle first, Moogle second) {
            // Case 1: second is a direct follow up of first, means merge
            if ((first.end + 1) == second.start) {
                return new Moogle(first.start, second.end, first.mogpoms);
            }
            // Case 2: Break. Means our current one ends and the next one is a distinct one
            // Current one is added as fragment
            var fragments = Stream.concat(first.mogpoms.stream(), Stream.of(first.toString())).toList();
            return new Moogle(second.start, second.end, fragments);
        }

        public String toString() {
            if (start == end) {
                return String.valueOf(start);
            }
            return start + "-" + end;
        }

        public String toFinalString() {
            return Stream.concat(mogpoms.stream(), Stream.of(toString()))
                    .collect(Collectors.joining(", "));
        }
    }
}
