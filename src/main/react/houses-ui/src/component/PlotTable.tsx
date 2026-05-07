import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import type {SearchResultEntryDto} from "../dto/dtos.ts";
import {ToggleButton} from "primereact/togglebutton";
import {type JSX, useMemo} from "react";
import {mapRows} from "../util/table-row-conversion.tsx";

export interface PlotTableRow {
    key: string;
    worldName: string;
    territoryName: string;
    plotName: string;
    plotOwner: JSX.Element | '';
    greeting: string;
    tags: string;
    lastUpdatedDate: string;
    lastGreetingUpdateDate: string;
    isFavorite: boolean;
    source: SearchResultEntryDto;
}


export interface PlotTableProperties {
    rows: SearchResultEntryDto[];
    favorites: number[];
    loading: boolean;
    favoritesPending: boolean;
    onFavoritesToggle: (row: SearchResultEntryDto, isFavorite: boolean) => void;
}


export function PlotTable(props: PlotTableProperties) {

    const DrawFavorites = (row: PlotTableRow) => {
        return (
            <ToggleButton disabled={props.favoritesPending} checked={row.isFavorite}
                          onChange={(e) => props.onFavoritesToggle(row.source, e.value)} onLabel="" offLabel=""
                          onIcon="pi pi-heart" offIcon="pi pi-heart"/>
        );
    }

    const tableRows = useMemo(() => mapRows(props.rows, props.favorites), [props.rows, props.favorites]);

    return (
        <DataTable value={tableRows}
                   size="small"
                   loading={props.loading}
                   dataKey="key"
                   scrollable scrollHeight="calc(100vh - 330px)"
                   cellMemo={true}
        >
            <Column style={{width: "100px"}} field="worldName" header="World"></Column>
            <Column style={{width: "100px"}} field="territoryName" header="Area"></Column>
            <Column style={{width: "130px"}} field="plotName" header="Plot"></Column>
            <Column style={{width: "150px"}} field="plotOwner" header="Owner"></Column>
            <Column field="greeting" header="Greeting"></Column>
            <Column style={{width: "450px"}} field="tags" header="Tags"></Column>
            <Column style={{width: "200px"}} field="lastUpdatedDate" header="Last Update"></Column>
            <Column style={{width: "200px"}} field="lastGreetingUpdateDate" header="Last Update (Greeting)"></Column>
            <Column field="isFavorite" body={DrawFavorites}></Column>
        </DataTable>
    )
}