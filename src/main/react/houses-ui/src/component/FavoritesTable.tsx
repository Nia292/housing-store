import {DataTable} from "primereact/datatable";
import {Column, type ColumnEditorOptions, type ColumnEvent} from "primereact/column";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import type {SearchResultEntryDto} from "../dto/dtos.ts";
import {mapRows} from "../util/table-row-conversion.tsx";
import type {PlotTableRow} from "./PlotTable.tsx";
import {InputText} from "primereact/inputtext";
import {Toast} from "primereact/toast";

export function FavoritesTable() {

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<PlotTableRow[]>([]);

    const toast = useRef<Toast>(null);

    useEffect(() => {
        asyncLoadData();
    }, []);

    function asyncLoadData(): void {
        setLoading(true);
        axios.get<SearchResultEntryDto[]>("/api/favorite/plots",)
            .then(value => {
                setLoading(false);
                setRows(mapRows(value.data, []))
            })
            .catch(err => {
                setLoading(false);
                console.log('error', err);
            })
    }

    function asyncUpdateFavorite(row: PlotTableRow, newComment: string) {
        setLoading(true)
        const uri = `/api/favorite/${row.source.worldId}/${row.source.territoryId}/${row.source.ward}/${row.source.plot.plotNumber}/comment`;
        axios.post(uri, newComment, {headers: {"Content-Type": "text/plain"}})
            .then(() => {
                setLoading(false);
                setRows(rows.map(r => r.key === row.key ? ({...r, personalComment: newComment}) : r));
                toast.current?.show({severity: 'success', summary: 'Favorite comment saved', life: 3000});
            })
            .catch(err => {
                setLoading(false);
                console.log('error', err);
                toast.current?.show({severity: 'error', summary: 'Error saving comment'});
            })
    }

    const CommentEditor = (options: ColumnEditorOptions) => {
        return <InputText type="text"
                          value={options.value}
                          onChange={(e) => options.editorCallback && options.editorCallback(e.target.value)}
        />;
    };

    function UpdateFavoriteComment(value: ColumnEvent): void {
        if (value.newValue !== value.value) {
            asyncUpdateFavorite(value.rowData, value.newValue);
        }
    }

    return (
        <>
            <Toast ref={toast}/>
            <DataTable value={rows}
                       size="small"
                       loading={loading}
                       dataKey="key"
                       scrollable scrollHeight="calc(100vh - 330px)"
                       cellMemo={true}
                       paginator={true}
                       rows={60}
                       editMode="cell"
                       rowsPerPageOptions={[10, 15, 30, 60]}
            >
                <Column style={{width: "100px"}} field="worldName" header="World" sortable
                        sortField="worldName"></Column>
                <Column style={{width: "100px"}} field="territoryName" header="Area" sortable
                        sortField="territoryName"></Column>
                <Column style={{width: "130px"}} field="plotName" header="Plot" sortable sortField="plotName"></Column>
                <Column style={{width: "150px"}} field="plotOwner" header="Owner"></Column>
                <Column style={{width: "450px"}} field="greeting" header="Greeting"></Column>
                <Column
                    editor={(options) => CommentEditor(options)} onCellEditComplete={UpdateFavoriteComment}
                    field="personalComment" header="Personal Comment"></Column>
                <Column style={{width: "450px"}} field="tags" header="Tags"></Column>
            </DataTable>
        </>

    )
}