export interface SearchResultDto {
    worldName: string;
    territoryName: string;
    ward: number;
    plot: {
        plotNumber: number;
        estateOwnerName: string;
        tagA: string;
        tagB: string;
        tagC: string;
        flags: string;
        greeting: string;
        lastUpdated: string;
        lastGreetingUpdated: string;
    }
}

export interface SearchDto {
    worldId: number | null;
    territoryId: number | null;
    wardNumber: number | null;
    owner: string | null;
    greeting: string | null;
    isOpen: boolean | null;
    page: number;
    pageSize: number;
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
