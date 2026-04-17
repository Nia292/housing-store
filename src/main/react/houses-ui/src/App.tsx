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
import {Paginator, type PaginatorPageChangeEvent} from "primereact/paginator";

const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined
})

const wardSuffix: Record<number, string> = {
    1: 'st',
    2: 'nd',
    3: 'rd'
}


function App() {
    const [availableWorlds, setAvailableWorlds] = useState<AvailableWorldDto[]>([]);
    const [availableTerritories, setAvailableTerritories] = useState<AvailableTerritoryDto[]>([]);

    const [searchResults, setSearchResults] = useState<SearchResultEntryDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [page, setPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(60);
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

        const search: SearchDto = {
            ...deferredSearch,
            page,
            pageSize
        };

        setLoading(true)
        axios.post<SearchResultDto>("/api/search", search)
            .then(value => {
                setSearchResults(value.data.plots);
                setLoading(false)
                setTotalRecords(value.data.totalElementCount)
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }, [deferredSearch, page, pageSize]);

    function onPageChange(pageChange: PaginatorPageChangeEvent) {
        setPage(pageChange.page);
        setPageSize(pageChange.rows);
    }

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

    const DrawPlotName = (row: SearchResultEntryDto) => {
        const ward = row.ward + 1;
        const suffix = wardSuffix[ward] ?? 'th';
        return `Plot ${row.plot.plotNumber}, ${ward}${suffix} ward`;
    }

    return (
        <PrimeReactProvider>
           <div style={{marginLeft: "12rem", marginRight: "12rem"}}>
               <h1>Housing Index</h1>
               <p>
                   A searchable housing index. Plot information including owner and tags are updated on viewing a ward. Greetings are only updated
                   when an entry is selected and the housing info sign is shown. Some filters are available. Filters are conditional-and filters, except when choosing multiple tags (= one-of)
               </p>
               <SearchBar onSearchChange={setDeferredSearch} availableTerritories={availableTerritories} availableWorlds={availableWorlds}/>
               <div className="prime-demo-card" style={{marginTop: "8px"}}>
                   <DataTable value={searchResults}
                              size="small"
                              loading={loading}
                              scrollable scrollHeight="calc(100vh - 320px)"
                   >
                       <Column style={{width: "100px"}} field="worldName" header="World"></Column>
                       <Column style={{width: "100px"}} field="territoryName" header="Area"></Column>
                       <Column style={{width: "130px"}} header="Plot" body={DrawPlotName}></Column>
                       <Column style={{width: "150px"}} header="Owner" body={DrawName}></Column>
                       <Column field="plot.greeting" header="Greeting"></Column>
                       <Column style={{width: "450px"}} header="Tags" body={DrawTags}></Column>
                       <Column style={{width: "200px"}} field="plot.lastUpdated" header="Last Update"
                               body={LastUpdatedDate}></Column>
                       <Column style={{width: "200px"}} field="plot.lastGreetingUpdated" header="Last Update (Greeting)"
                               body={LastGreetingUpdateDate}></Column>
                   </DataTable>
               </div>
               <div>
                   <Paginator first={page * 60}
                              rows={pageSize}
                              totalRecords={totalRecords}
                              rowsPerPageOptions={[20, 30, 60, 120]}
                              onPageChange={onPageChange}
                   />
               </div>
           </div>
        </PrimeReactProvider>
    )
}

export default App
