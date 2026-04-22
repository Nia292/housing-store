import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import type {SearchResultEntryDto} from "../dto/dtos.ts";
import {ToggleButton} from "primereact/togglebutton";
import {type JSX, useMemo} from "react";

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

function formatPlotName(row: SearchResultEntryDto): string {
    const ward = row.ward + 1;
    return `Ward ${ward}, Plot ${row.plot.plotNumber}`;
}


function formatDate(date: string | null) {
    if (date == null) {
        return '-';
    }
    return dateFormat.format(new Date(date));
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

function mapRows(rows: SearchResultEntryDto[], favorites: number[]): PlotTableRow[] {
    return rows.map(row => ({
        source: row,
        greeting: row.plot.greeting,
        isFavorite: favorites.includes(row.plot.id),
        lastGreetingUpdateDate: formatDate(row.plot.lastGreetingUpdated),
        lastUpdatedDate: formatDate(row.plot.lastUpdated),
        plotName: formatPlotName(row),
        plotOwner: DrawName(row),
        key: row.key,
        tags: DrawTags(row),
        territoryName: row.territoryName,
        worldName: row.worldName,
    }))
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
                   scrollable scrollHeight="calc(100vh - 320px)"
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