package eu.moon.housingdb;

import eu.moon.housingdb.dto.MissingData;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StringConversionsTest {

    private static Stream<Arguments> wardConversionTestData() {
        return Stream.of(
                Arguments.of(missingData(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30), "all"),
                Arguments.of(missingData(1, 2, 3, 4, 28, 29, 30), "1-4, 28-30"),
                Arguments.of(missingData(1, 2, 3, 4, 7, 28, 29, 30), "1-4, 7, 28-30")
        );
    }

    @ParameterizedTest
    @MethodSource("wardConversionTestData")
    void testWardString(List<MissingData> wards, String expected) {
        var res = StringConversions.stringify(wards);
        assertEquals(expected, res);
    }

    private static List<MissingData> missingData(Integer...wards) {
        return Stream.of(wards)
                .map(integer -> new MissingData("", "", 0, integer))
                .toList();
    }
}