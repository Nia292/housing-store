export interface SearchResultEntryDto {
    worldName: string;
    territoryName: string;
    ward: number;
    plot: {
        plotNumber: number;
        estateOwnerName: string;
        tagA: HousingTag;
        tagB: HousingTag;
        tagC: HousingTag;
        flags: string;
        greeting: string;
        lastUpdated: string;
        lastGreetingUpdated: string;

        freeCompany: boolean;
        owned: boolean;
        visitorsAllowed: boolean;
        built: boolean;
    }
}

export interface SearchResultDto {
    plots: SearchResultEntryDto[];
    totalElementCount: number;
}

export interface SearchDto {
    worldId: number | null;
    territoryId: number | null;
    wardNumber: number | null;
    owner: string | null;
    greeting: string | null;
    isOpen: boolean | null;
    tags: HousingTag[];
    page: number;
    pageSize: number;
    onlyFilled: boolean;
}

export interface AvailableDataDto {
    worlds: AvailableWorldDto[];
    territories: AvailableTerritoryDto[];
}

export interface AvailableWorldDto {
    name: string;
    id: number;
}

export interface AvailableTerritoryDto {
    name: string;
    id: number;
}

export enum HousingTag {
    None = "None",
    Emporium = "Emporium",
    Boutique = "Boutique",
    DesignerHome = "DesignerHome",
    MessageBook = "MessageBook",
    Tavern = "Tavern",
    Eatery = "Eatery",
    ImmersiveExperience = "ImmersiveExperience",
    Cafe = "Cafe",
    Aquarium = "Aquarium",
    Sanctuary = "Sanctuary",
    Venue = "Venue",
    Florist = "Florist",
    Unknown13 = "Unknown13",
    Library = "Library",
    PhotoStudio = "PhotoStudio",
    HauntedHouse = "HauntedHouse",
    Atelier = "Atelier",
    Bathhouse = "Bathhouse",
    Garden = "Garden",
    FarEastern = "FarEastern",
    VisitorsWelcome = "VisitorsWelcome",
    UnderConstruction = "UnderConstruction",
    Bakery = "Bakery",
    ConcertHall = "ConcertHall",
    Unknown25 = "Unknown25",
    Unknown26 = "Unknown26",
    Unknown27 = "Unknown27",
    Unknown28 = "Unknown28",
    Unknown29 = "Unknown29",
    Unknown30 = "Unknown30"
}