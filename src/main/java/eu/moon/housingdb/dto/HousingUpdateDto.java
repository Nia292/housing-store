package eu.moon.housingdb.dto;

public record HousingUpdateDto(HouseId HouseId, HouseMetaData HouseMetaData, String Greeting) {

    public record HouseId(int WorldId, int TerritoryTypeId, int WardNumber, int PlotNumber) {

    }

    public record HouseMetaData(String EstateOwnerName, short InfoFlags, int TagA, int TagB, int TagC) {

    }
}

