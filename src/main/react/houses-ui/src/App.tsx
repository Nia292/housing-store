import {useEffect, useState} from 'react'
import {PrimeReactProvider} from 'primereact/api';
import axios from 'axios';
import type {
    AvailableDataDto,
    AvailableTerritoryDto,
    AvailableWorldDto,
    SearchDto,
    SearchResultDto
} from "./dto/dtos.ts";
import {DataTable} from "primereact/datatable";
import {Column} from 'primereact/column';
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import type {Callback} from "../types.ts";

const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined
})

function WorldFilter(props: {selectedWorld: number | null, availableWorlds: AvailableWorldDto[], selectWorld: Callback<number>}) {
    return (<div className="flex flex-column">
        <label htmlFor="world-filter">Select World</label>
        <Dropdown
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


function App() {
    const [availableWorlds, setAvailableWorlds] = useState<AvailableWorldDto[]>([]);
    const [availableTerritories, setAvailableTerritories] = useState<AvailableTerritoryDto[]>([]);

    const [greetingSearch, setGreetingSearch] = useState<string>('');
    const [onwerSearch, setOwnerSearch] = useState<string>('');
    const [selectedWorld, setSelectedWorld] = useState<number | null>(403); // 403 = Raiden
    const [selectedTerritory, setSelectedTerritory] = useState<number | null>(null);

    const [searchResults, setSearchResults] = useState<SearchResultDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [deferredSearch, setDeferredSearch] = useState<SearchDto | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const searchDto: SearchDto = {
                owner: onwerSearch,
                isOpen: true,
                worldId: selectedWorld,
                greeting: greetingSearch,
                territoryId: selectedTerritory,
                wardNumber: null,
                page: 0,
                pageSize: 60
            }
            setDeferredSearch(searchDto)
        }, 500);
        return () => clearTimeout(timeout);
    }, [greetingSearch, onwerSearch, selectedWorld, selectedTerritory]);

    useEffect(() => {
        axios.get<AvailableDataDto>("/api/available-data")
            .then(value => {
                setAvailableWorlds(value.data.worlds);
                setAvailableTerritories(value.data.territories);
            })
    }, []);

    useEffect(() => {
        if (deferredSearch == null) {
            return;
        }

        setLoading(true)
        axios.post<SearchResultDto[]>("/api/search", deferredSearch)
            .then(value => {
                setSearchResults(value.data);
                setLoading(false)
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }, [deferredSearch]);


    const LastUpdatedDate = (row: SearchResultDto) => {
        if (row.plot.lastUpdated == null) {
            return "-"
        }
        return dateFormat.format(new Date(row.plot.lastUpdated));
    }

    const LastGreetingUpdateDate = (row: SearchResultDto) => {
        if (row.plot.lastGreetingUpdated == null) {
            return "-"
        }
        return dateFormat.format(new Date(row.plot.lastGreetingUpdated));
    }

   function renderHeader() {
        return <div style={{display: "flex", flexDirection: "row"}}>
            <div style={{marginRight: "8px"}}><WorldFilter availableWorlds={availableWorlds} selectedWorld={selectedWorld} selectWorld={setSelectedWorld}/></div>
            <div style={{marginRight: "8px"}}><TerritoryFilter availableTerritories={availableTerritories} selectedTerritory={selectedTerritory} setSelectedTerritory={setSelectedTerritory}/></div>
            <div style={{marginRight: "8px"}}><TextFilter inputId="owner-filter" text={onwerSearch} setText={setOwnerSearch} placeholder="Search Owner"/></div>
            <div style={{marginRight: "8px"}}><TextFilter inputId="greeting-filter" text={greetingSearch} setText={setGreetingSearch} placeholder="Search Greeting"/></div>
        </div>
    }

    const header = renderHeader();
    return (
        <PrimeReactProvider>
            <DataTable value={searchResults}
                       size="small"
                       loading={loading}
                       header={header}
            >
                <Column style={{width: "200px"}} field="worldName" filter header="World" showFilterMenu={false}
                        className={"w-full"}></Column>
                <Column style={{width: "200px"}} field="territoryName" header="Area"></Column>
                <Column style={{width: "60px"}} field="ward" header="Ward"></Column>
                <Column style={{width: "60px"}} field="plot.plotNumber" header="Plot"></Column>
                <Column field="plot.estateOwnerName" header="Owner"></Column>
                <Column field="plot.greeting" header="Greeting"></Column>
                <Column style={{width: "150px"}} field="plot.tagA" header="Tag 1"></Column>
                <Column style={{width: "150px"}} field="plot.tagB" header="Tag 2"></Column>
                <Column style={{width: "150px"}} field="plot.tagC" header="Tag 3"></Column>
                <Column style={{width: "200px"}} field="plot.lastUpdated" header="Last Update"
                        body={LastUpdatedDate}></Column>
                <Column style={{width: "200px"}} field="plot.lastGreetingUpdated" header="Last Update (Greeting)"
                        body={LastGreetingUpdateDate}></Column>
            </DataTable>
        </PrimeReactProvider>
    )
}

export default App
