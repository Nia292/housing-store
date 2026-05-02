import * as React from 'react'
import {PrimeReactProvider} from 'primereact/api';
import axios from 'axios';
import {
    type AvailableDataDto,
    type AvailableTerritoryDto,
    type AvailableWorldDto,
    type MissingDataDto,
    type SearchDto,
    type SearchResultDto,
    type SearchResultEntryDto
} from "./dto/dtos.ts";
import {SearchBar} from "./component/SearchBar.tsx";
import {Paginator, type PaginatorPageChangeEvent} from "primereact/paginator";
import {PlotTable} from "./component/PlotTable.tsx";
import {MissingWardsSidebar} from "./component/MissingWardsSidebar.tsx";

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
    missingWardsOpen: boolean;
    missingData: MissingDataDto[];
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
        missingWardsOpen: false,
        missingData: []
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
        this.onSearchOrPageChange();
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

    asyncLoadMissingData() {
        axios.get<MissingDataDto[]>('/api/missing-data')
            .then(value => {
                this.setState({missingData: value.data})
            })
            .catch((err) => {
                console.error(err);
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

    setDeferredSearch = (search: SearchDto | null) => {
        this.setState({deferredSearch: search}, () => this.onSearchOrPageChange());
    }

    onMissingWardsClick = () => {
        if (!this.state.missingWardsOpen) {
            this.asyncLoadMissingData();
        }
        this.setState({missingWardsOpen: !this.state.missingWardsOpen});

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
                               availableWorlds={this.state.availableWorlds}
                               onMissingWardsClick={this.onMissingWardsClick}
                    />
                    <div className="prime-demo-card" style={{marginTop: "8px"}}>
                        <PlotTable loading={this.state.loading}
                                   rows={this.state.searchResults}
                                   favorites={this.state.favorites}
                                   favoritesPending={this.state.favoritesPending}
                                   onFavoritesToggle={this.onFavoritesToggle}
                        >
                        </PlotTable>
                    </div>
                    <div>
                        <Paginator first={this.state.page * 60}
                                   rows={this.state.pageSize}
                                   totalRecords={this.state.totalRecords}
                                   rowsPerPageOptions={[20, 30, 60, 120]}
                                   onPageChange={this.onPageChange}
                        />
                    </div>
                   <MissingWardsSidebar data={this.state.missingData} open={this.state.missingWardsOpen} toggle={this.onMissingWardsClick}></MissingWardsSidebar>
                </div>
            </PrimeReactProvider>
        );
    }
}

export default App
