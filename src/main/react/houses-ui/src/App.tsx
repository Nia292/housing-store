import {useEffect, useState} from 'react'
import {PrimeReactProvider} from 'primereact/api';
import axios from 'axios';
import {
    type AvailableDataDto,
    type AvailableTerritoryDto,
    type AvailableWorldDto,
    type SearchDto,
    type SearchResultDto,
    type SearchResultEntryDto
} from "./dto/dtos.ts";
import {DataTable} from "primereact/datatable";
import {Column} from 'primereact/column';
import {SearchBar} from "./component/SearchBar.tsx";

const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined
})


function App() {
    const [availableWorlds, setAvailableWorlds] = useState<AvailableWorldDto[]>([]);
    const [availableTerritories, setAvailableTerritories] = useState<AvailableTerritoryDto[]>([]);

    const [searchResults, setSearchResults] = useState<SearchResultEntryDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [deferredSearch, setDeferredSearch] = useState<SearchDto | null>(null);

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
        axios.post<SearchResultDto>("/api/search", deferredSearch)
            .then(value => {
                setSearchResults(value.data.plots);
                setLoading(false)
                setTotalRecords(value.data.totalElementCount)
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }, [deferredSearch]);

    const LastUpdatedDate = (row: SearchResultEntryDto) => {
        if (row.plot.lastUpdated == null) {
            return "-"
        }
        return dateFormat.format(new Date(row.plot.lastUpdated));
    }

    const LastGreetingUpdateDate = (row: SearchResultEntryDto) => {
        if (row.plot.lastGreetingUpdated == null) {
            return "-"
        }
        return dateFormat.format(new Date(row.plot.lastGreetingUpdated));
    }

    const DrawTags = (row: SearchResultEntryDto) => {
        return [row.plot.tagA, row.plot.tagB, row.plot.tagC]
            .filter(value => value != "None")
            .join(", ");
    }

    const DrawName = (row: SearchResultEntryDto) => {
        if (!row.plot.lastUpdated) {
            return '';
        }
        if (!row.plot.built) {
            return <span className="for-sale">For Sale</span>
        }
        const label = row.plot.freeCompany ? `<${row.plot.estateOwnerName}>` : row.plot.estateOwnerName;
        if (!row.plot.visitorsAllowed) {
            return <span className="no-visitor">{label}</span>
        }
        return <span className="yes-visitor">{label}</span>
    }

    return (
        <PrimeReactProvider>
            <DataTable value={searchResults}
                       size="small"
                       loading={loading}
                       header={<SearchBar onSearchChange={setDeferredSearch} totalRecords={totalRecords} availableTerritories={availableTerritories} availableWorlds={availableWorlds}/>}
            >
                <Column style={{width: "200px"}} field="worldName" filter header="World" showFilterMenu={false}
                        className={"w-full"}></Column>
                <Column style={{width: "200px"}} field="territoryName" header="Area"></Column>
                <Column style={{width: "60px"}} field="ward" header="Ward"></Column>
                <Column style={{width: "60px"}} field="plot.plotNumber" header="Plot"></Column>
                <Column header="Owner" body={DrawName}></Column>
                <Column field="plot.greeting" header="Greeting"></Column>
                <Column style={{width: "450px"}} header="Tags" body={DrawTags}></Column>
                <Column style={{width: "200px"}} field="plot.lastUpdated" header="Last Update"
                        body={LastUpdatedDate}></Column>
                <Column style={{width: "200px"}} field="plot.lastGreetingUpdated" header="Last Update (Greeting)"
                        body={LastGreetingUpdateDate}></Column>
            </DataTable>
        </PrimeReactProvider>
    )
}

export default App
