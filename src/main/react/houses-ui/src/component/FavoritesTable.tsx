import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {useEffect, useState} from "react";
import axios from "axios";
import type {SearchResultEntryDto} from "../dto/dtos.ts";
import {mapRows} from "../util/table-row-conversion.tsx";
import type {PlotTableRow} from "./PlotTable.tsx";

export function FavoritesTable() {

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<PlotTableRow[]>([]);

    function asyncLoadData(): void {
        axios.get<SearchResultEntryDto[]>("/api/favorite-plots",)
            .then(value => {
                setLoading(false);
                setRows(mapRows(value.data, []))
            })
            .catch(err => {
                setLoading(false);
                console.log('error', err);
            })
    }

    useEffect(() => {
        asyncLoadData();
    }, []);

    return (
        <DataTable value={rows}
                   size="small"
                   loading={loading}
                   dataKey="key"
                   scrollable scrollHeight="calc(100vh - 330px)"
                   cellMemo={true}
                   paginator={true}
                   rows={60}
                   rowsPerPageOptions={[10, 15, 30, 60]}
        >
            <Column style={{width: "100px"}} field="worldName" header="World" sortable sortField="worldName"></Column>
            <Column style={{width: "100px"}} field="territoryName" header="Area"  sortable sortField="territoryName"></Column>
            <Column style={{width: "130px"}} field="plotName" header="Plot" sortable sortField="plotName"></Column>
            <Column style={{width: "150px"}} field="plotOwner" header="Owner"></Column>
            <Column field="greeting" header="Greeting"></Column>
            <Column style={{width: "450px"}} field="tags" header="Tags"></Column>
            <Column style={{width: "200px"}} field="lastUpdatedDate" header="Last Update"></Column>
            <Column style={{width: "200px"}} field="lastGreetingUpdateDate" header="Last Update (Greeting)"></Column>
        </DataTable>
    )
}