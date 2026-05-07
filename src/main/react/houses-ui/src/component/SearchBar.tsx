import type {Callback} from "../../types.ts";
import {type AvailableDataCenterDto, type AvailableTerritoryDto, HousingTag, type SearchDto} from "../dto/dtos.ts";
import {useEffect, useMemo, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {MultiSelect} from "primereact/multiselect";
import {type SetURLSearchParams, useSearchParams} from "react-router-dom";
import {GlobalSearch} from "./GlobalSearch.tsx";
import {Button} from "primereact/button";
import {getHousingTagFilters} from "../util/enum-utils.ts";
import {MissingWardsSidebar} from "./MissingWardsSidebar.tsx";

function WorldFilter(props: {
    selectedWorld: number | null,
    availableDataCenters: AvailableDataCenterDto[],
    selectWorld: Callback<number>
}) {
    return (<div className="flex flex-column">
        <label htmlFor="world-filter">Select World</label>
        <Dropdown
            filter
            value={props.selectedWorld}
            options={props.availableDataCenters}
            showClear={true}
            onChange={(e) => props.selectWorld(e.value)}
            optionGroupLabel="name"
            optionGroupChildren="worlds"
            optionLabel="name"
            optionValue="id"
            id="world-filter"
            style={{width: "170px"}}
        />
    </div>)
}

const availableTags = getHousingTagFilters();

function TagFilter(props: { inputId: string, selectedTags: HousingTag[], setSelectedTags: Callback<HousingTag[]> }) {
    return (<div className="flex flex-column">
        <label htmlFor={props.inputId}>Filter Tags</label>
        <MultiSelect style={{width: "280px"}}
                     value={props.selectedTags}
                     onChange={(e) => props.setSelectedTags(e.value)}
                     options={availableTags}
                     placeholder="Select Tags"
                     showClear
                     filter
        />
    </div>)
}

function tryParseNumber(v: string | null | undefined): number | null {
    if (v == null) {
        return null;
    }
    const num = Number(v);
    if (Number.isNaN(num)) {
        return null;
    }
    return num;
}

function updateQuery(key: string, value: number | null, setSearchParams: SetURLSearchParams): void {
    if (value == null) {
        setSearchParams(prev => {
            prev.delete(key);
            return prev;
        }, {replace: true})
    } else {
        setSearchParams(prev => {
            prev.set(key, value.toString(10));
            return prev;
        }, {replace: true})
    }
}

interface SearchBarProps {
    showFavorites: boolean;
    availableDataCenters: AvailableDataCenterDto[];
    availableTerritories: AvailableTerritoryDto[];

    onSearchChange: Callback<SearchDto>;
    onReload: Callback<void>;
    onToggleFavorites: Callback<void>;
}

export function SearchBar(props: SearchBarProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedTags, setSelectedTags] = useState<HousingTag[]>([]);
    const [searchKeys, setSearchKeys] = useState<string[]>(["status: collected"]);
    const [conjunctive, setConjunctive] = useState<boolean>(true);

    const selectedWorld = useMemo(() => tryParseNumber(searchParams.get('world')), [searchParams]);
    const setSelectedWorld = (world: number | null) => updateQuery("world", world, setSearchParams);



    useEffect(() => {
        const timeout = setTimeout(() => {
            const searchDto: SearchDto = {
                worldId: selectedWorld,
                territoryId: null,
                wardNumber: null,
                tags: selectedTags,
                page: 0, // set later
                pageSize: 0, // set later
                searchKeys: searchKeys,
                matchConjunctive: conjunctive
            }
            props.onSearchChange(searchDto);
        }, 300);
        return () => clearTimeout(timeout);
    }, [selectedWorld, selectedTags, conjunctive, searchKeys]);

    useEffect(() => {
        if (selectedWorld == null) {
            setSelectedWorld(403);
        }
    }, []);

    return (<div style={{display: "flex", flexDirection: "row"}}>
        { !props.showFavorites &&
            <>
                <div style={{marginRight: "8px"}}>
                    <WorldFilter availableDataCenters={props.availableDataCenters}
                                 selectedWorld={selectedWorld}
                                 selectWorld={setSelectedWorld}
                    />
                </div>
                <div style={{marginRight: "8px"}}><TagFilter inputId="tag-filter" selectedTags={selectedTags}
                                                             setSelectedTags={setSelectedTags}/></div>
                <div style={{marginRight: "8px"}}>
                    <GlobalSearch
                        searchTerms={searchKeys}
                        and={conjunctive}
                        onSearchTermsChange={setSearchKeys}
                        onAndChange={setConjunctive}
                        availableTerritories={props.availableTerritories}
                    >
                    </GlobalSearch>
                </div>
                <div style={{marginLeft: "auto"}}>
                    <Button style={{marginTop: "18px"}}
                            icon="pi pi-sync"
                            onClick={() => props.onReload()}
                            tooltip="Refresh Data"
                    />
                </div>
                <div style={{marginLeft: "8px"}}>
                    <Button style={{marginTop: "18px"}}
                            icon="pi pi-heart"
                            onClick={() => props.onToggleFavorites()}
                            tooltip="Show Your Favorites"
                    />
                </div>
            </>
        }
        {
            props.showFavorites &&  <div style={{marginLeft: "auto"}}>
                <Button style={{marginTop: "18px"}} icon="pi pi-heart" onClick={() => props.onToggleFavorites()}></Button>
            </div>
        }

        <div style={{marginLeft: "8px"}}>
            <MissingWardsSidebar />
        </div>
    </div>)
}