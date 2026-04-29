import type {Callback} from "../../types.ts";
import {type AvailableTerritoryDto, type AvailableWorldDto, HousingTag, type SearchDto} from "../dto/dtos.ts";
import {useContext, useEffect, useMemo, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import {MultiSelect} from "primereact/multiselect";
import {Checkbox} from "primereact/checkbox";
import {ToggleButton} from "primereact/togglebutton";
import {PrimeReactContext} from "primereact/api";
import {type SetURLSearchParams, useSearchParams} from "react-router-dom";

function WorldFilter(props: {selectedWorld: number | null, availableWorlds: AvailableWorldDto[], selectWorld: Callback<number>}) {
    return (<div className="flex flex-column">
        <label htmlFor="world-filter">Select World</label>
        <Dropdown
            filter
            value={props.selectedWorld}
            options={props.availableWorlds}
            showClear={true}
            onChange={(e) => props.selectWorld(e.value)}
            optionLabel="name"
            optionValue="id"
            id="world-filter"
            style={{width: "200px"}}
        />
    </div>)
}

function TerritoryFilter(props: {selectedTerritory: number | null, availableTerritories: AvailableWorldDto[], setSelectedTerritory: Callback<number>}) {
    return (<div className="flex flex-column">
        <label htmlFor="territory-filter">Select Area</label>
        <Dropdown
            filter
            id="territory-filter"
            value={props.selectedTerritory}
            options={props.availableTerritories}
            showClear={true}
            onChange={(e) => props.setSelectedTerritory(e.value)}
            optionLabel="name"
            optionValue="id"
            style={{width: "200px"}}
        />
    </div>)
}

function TextFilter(props: {inputId: string, text: string, setText: Callback<string>, placeholder: string}) {
    return (<div className="flex flex-column">
        <label htmlFor={props.inputId}>{props.placeholder}</label>
        <InputText style={{width: "200px"}} id={props.inputId} placeholder={props.placeholder} value={props.text}
                   onChange={(e) => props.setText(e.target.value)}/>
    </div>)
}

const availableTags: HousingTag[] = Object.keys(HousingTag).filter(value => isNaN(Number(value))) as HousingTag[];

function TagFilter(props: {inputId: string, selectedTags: HousingTag[], setSelectedTags: Callback<HousingTag[]>}) {
    return (<div className="flex flex-column">
        <label htmlFor={props.inputId}>Filter Tags</label>
        <MultiSelect style={{width: "300px"}} value={props.selectedTags} onChange={(e) => props.setSelectedTags(e.value)} options={availableTags}
                     placeholder="Select Tags" maxSelectedLabels={3} />
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
    availableWorlds: AvailableWorldDto[];
    availableTerritories: AvailableTerritoryDto[];

    onSearchChange: Callback<SearchDto>;
}

export function SearchBar(props: SearchBarProps) {
    const [searchParams, setSearchParams] = useSearchParams({world: "403"});

    const [greetingSearch, setGreetingSearch] = useState<string>('');
    const [onwerSearch, setOwnerSearch] = useState<string>('');
    const [onlyCollected, setOnlyCollected] = useState<boolean>(true);
    const [hasGreeting, setHasGreeting] = useState<boolean>(false);
    const [onlyOpen, setOnlyOpen] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<HousingTag[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const { changeTheme } = useContext(PrimeReactContext);

    const selectedWorld = useMemo(() => tryParseNumber(searchParams.get('world')), [searchParams]);
    const setSelectedWorld = (world: number | null) => updateQuery("world", world, setSearchParams);

    const selectedTerritory = useMemo(() => tryParseNumber(searchParams.get('territory')), [searchParams]);
    const setSelectedTerritory = (territory: number | null) => updateQuery("territory", territory, setSearchParams);

    useEffect(() => {
        const theme = darkMode ? "lara-light-indigo" : "lara-dark-indigo";
        const previousTheme = darkMode ? "lara-dark-indigo" : "lara-light-indigo";
        if (changeTheme) {
            changeTheme(previousTheme, theme, "theme-link", () => console.log('Done!'));
        }
    }, [darkMode]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const searchDto: SearchDto = {
                owner: onwerSearch,
                worldId: selectedWorld,
                greeting: greetingSearch,
                territoryId: selectedTerritory,
                wardNumber: null,
                onlyFilled: onlyCollected,
                tags: selectedTags,
                page: 0, // set later
                pageSize: 0, // set later
                onlyOpen: onlyOpen,
                onlyWithGreeting: hasGreeting
            }
            props.onSearchChange(searchDto);
        }, 300);
        return () => clearTimeout(timeout);
    }, [greetingSearch, onwerSearch, selectedWorld, selectedTerritory, onlyCollected, selectedTags, onlyOpen, hasGreeting]);

    return (<div style={{display: "flex", flexDirection: "row"}}>
        <div style={{marginRight: "8px"}}><WorldFilter availableWorlds={props.availableWorlds} selectedWorld={selectedWorld} selectWorld={setSelectedWorld}/></div>
        <div style={{marginRight: "8px"}}><TerritoryFilter availableTerritories={props.availableTerritories} selectedTerritory={selectedTerritory} setSelectedTerritory={setSelectedTerritory}/></div>
        <div style={{marginRight: "8px"}}><TextFilter inputId="owner-filter" text={onwerSearch} setText={setOwnerSearch} placeholder="Search Owner"/></div>
        <div style={{marginRight: "8px"}}><TextFilter inputId="greeting-filter" text={greetingSearch} setText={setGreetingSearch} placeholder="Search Greeting"/></div>
        <div style={{marginRight: "8px"}}><TagFilter inputId="tag-filter" selectedTags={selectedTags} setSelectedTags={setSelectedTags}/></div>
        <div style={{marginRight: "8px"}} className="flex flex-column">
            <div className="flex flex-center" style={{marginTop: "auto"}}>
                <Checkbox inputId="only-collected" onChange={(e) => setOnlyCollected(e.checked ?? false)} checked={onlyCollected} />
                <label className="ml-2" htmlFor="only-collected">Hide Never Indexed</label>
            </div>
            <div className="flex flex-center" style={{marginRight: "auto"}}>
                <Checkbox inputId="has-greeting" checked={hasGreeting} onChange={(e) => setHasGreeting(e.checked ?? false)} />
                <label className="ml-2" htmlFor="has-greeting">Only With Greeting</label>
            </div>
            <div className="flex flex-center" style={{marginRight: "auto"}}>
                <Checkbox inputId="is-open" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.checked ?? false)} />
                <label className="ml-2" htmlFor="is-open">Only Accessible</label>
            </div>
        </div>
        <div style={{marginLeft: "auto"}}>
            <ToggleButton onIcon="pi pi-moon" offIcon="pi pi-sun"
                          offLabel="Not Luna Mode"
                          onLabel="Luna Mode"
                          checked={darkMode} onChange={(e) => setDarkMode(e.value)} />
        </div>
    </div>)
}