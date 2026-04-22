import * as React from 'react'
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
import {ToggleButton} from "primereact/togglebutton";

const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined
})


const DrawTags = (row: SearchResultEntryDto) => {
    return [row.plot.tagA, row.plot.tagB, row.plot.tagC]
        .filter(value => value != "None")
        .join(", ");
}

const DrawPlotName = (row: SearchResultEntryDto) => {
    const ward = row.ward + 1;
    return `Ward ${ward}, Plot ${row.plot.plotNumber}`;
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppProps {
}

interface AppState {
    availableWorlds: AvailableWorldDto[];
    availableTerritories: AvailableTerritoryDto[];
    deferredSearch: SearchDto | null;
    favorites: number[];
    favoritesPending: boolean;
    loading: boolean;
    page: number;
    pageSize: number;
    searchResults: SearchResultEntryDto[];
    totalRecords: number;
}

class App extends React.Component<AppProps, AppState> {
    state = {
        availableWorlds: [],
        availableTerritories: [],
        deferredSearch: null,
        favorites: [],
        favoritesPending: false,
        loading: false,
        page: 0,
        pageSize: 60,
        searchResults: [],
        totalRecords: 0,
    } satisfies AppState as AppState;

    componentDidMount() {
        axios.get<AvailableDataDto>("/api/available-data")
            .then(value => {
                this.setState({
                    availableWorlds: value.data.worlds,
                    availableTerritories: value.data.territories,
                });
            });
        this.asyncLoadFavorites();
    }

    onSearchOrPageChange() {
        if (this.state.deferredSearch == null) {
            return;
        }

        const search: SearchDto = {
            ...this.state.deferredSearch,
            page: this.state.page,
            pageSize: this.state.pageSize
        };

        this.setState({loading: true});
        axios.post<SearchResultDto>("/api/search", search)
            .then(value => {
                this.setState({
                    searchResults: value.data.plots,
                    loading: false,
                    totalRecords: value.data.totalElementCount
                });
            })
            .catch(err => {
                console.error(err);
                this.setState({loading: false});
            })
    }

    asyncLoadFavorites() {
        this.setState({favoritesPending: true});
        axios.get<number[]>(`/api/favorites`)
            .then(value => {
                this.setState({
                    favorites: value.data,
                    favoritesPending: false,
                });
            })
            .catch((err) => {
                console.error(err);
                this.setState({
                    favoritesPending: false
                });
            })
    }

    asyncSetFavorite(plot: SearchResultEntryDto, isFavorite: boolean): void {
        this.setState({favoritesPending: true});
        axios.post(`/api/favorite/${plot.worldId}/${plot.territoryId}/${plot.ward}/${plot.plot.plotNumber}/${isFavorite}`)
            .then(() => {
                this.asyncLoadFavorites();
            })
            .catch((err) => {
                console.error(err);
                this.setState({favoritesPending: false});
            })
    }

    onPageChange = (pageChange: PaginatorPageChangeEvent) => {
        this.setState({
            page: pageChange.page,
            pageSize: pageChange.rows,
        }, () => this.onSearchOrPageChange());
    }

    onFavoritesToggle = (row: SearchResultEntryDto, favorite: boolean) => {
        this.asyncSetFavorite(row, favorite);
    }

    DrawFavorites = (row: SearchResultEntryDto) => {
        return (
            <ToggleButton disabled={this.state.favoritesPending} checked={this.state.favorites.includes(row.plot.id)}
                          onChange={(e) => this.onFavoritesToggle(row, e.value)} onLabel="" offLabel=""
                          onIcon="pi pi-heart" offIcon="pi pi-heart"/>
        );
    }

    setDeferredSearch = (search: SearchDto | null) => {
        this.setState({deferredSearch: search}, () => this.onSearchOrPageChange());
    }

    render() {
        return (
            <PrimeReactProvider>
                <div style={{marginLeft: "12rem", marginRight: "12rem"}}>
                    <h1>Housing Index</h1>
                    <p>
                        A searchable housing index. Plot information including owner and tags are updated on viewing a
                        ward.
                        Greetings are only updated
                        when an entry is selected and the housing info sign is shown. Some filters are available.
                        Filters
                        are conditional-and filters, except when choosing multiple tags (= one-of)
                    </p>
                    <SearchBar onSearchChange={this.setDeferredSearch}
                               availableTerritories={this.state.availableTerritories}
                               availableWorlds={this.state.availableWorlds}/>
                    <div className="prime-demo-card" style={{marginTop: "8px"}}>
                        <DataTable value={this.state.searchResults}
                                   size="small"
                                   loading={this.state.loading}
                                   dataKey="key"
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
                            <Column style={{width: "200px"}} field="plot.lastGreetingUpdated"
                                    header="Last Update (Greeting)"
                                    body={LastGreetingUpdateDate}></Column>
                            <Column body={this.DrawFavorites}></Column>
                        </DataTable>
                    </div>
                    <div>
                        <Paginator first={this.state.page * 60}
                                   rows={this.state.pageSize}
                                   totalRecords={this.state.totalRecords}
                                   rowsPerPageOptions={[20, 30, 60, 120]}
                                   onPageChange={this.onPageChange}
                        />
                    </div>
                </div>
            </PrimeReactProvider>
        );
    }
}

export default App
