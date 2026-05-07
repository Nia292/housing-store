import {Sidebar} from "primereact/sidebar";
import type {MissingDataDto} from "../dto/dtos.ts";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import axios from "axios";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";


export function MissingWardsSidebar() {

    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [missingData, setMissingData] = useState<MissingDataDto[]>([]);

    function asyncLoadMissingData() {
        setLoading(true);
        axios.get<MissingDataDto[]>('/api/missing-data')
            .then(value => {
                setMissingData(value.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            })
    }

    useEffect(() => {
        if (open) {
            asyncLoadMissingData()
        }
    }, [open]);

    return (
        <>
            <Button style={{marginTop: "18px"}} tooltip="Missing Wards"
                    icon="pi pi-server"
                    onClick={() => setOpen(!open)}></Button>
            <Sidebar visible={open}
                     position="right"
                     style={{minWidth: "30%"}}
                     onHide={() => setOpen(false)}>
                <h2>Missing Wards and Plots</h2>
                <div>
                    <p>
                        Wards with missing data - needs scraping.
                    </p>
                    <DataTable value={missingData} paginator rows={60} rowsPerPageOptions={[5, 10, 25, 50]}
                               scrollable scrollHeight="calc(100vh - 320px)"
                               filterDisplay="row"
                               size="small"
                               loading={loading}
                    >
                        <Column field="worldName" filter header="World" filterField="worldName"></Column>
                        <Column field="territoryName" header="Area"></Column>
                        <Column field="missingWards" header="Missing Wards"></Column>
                    </DataTable>
                </div>
            </Sidebar>
        </>
    )
}