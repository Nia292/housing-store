import {Sidebar} from "primereact/sidebar";
import type {Callback} from "../../types.ts";
import type {MissingDataDto} from "../dto/dtos.ts";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";


export interface MissingWardsSidebarProps {
    data: MissingDataDto[];
    open: boolean;
    toggle: Callback<void>;
}

export function MissingWardsSidebar(props: MissingWardsSidebarProps) {
    return (<Sidebar visible={props.open}
                     position="right"
                     style={{minWidth: "30%"}}
                     onHide={() => props.toggle()}>
        <h2>Missing Wards and Plots</h2>
        <div>
            <p>
                Wards with missing data - needs scraping.
            </p>
            <DataTable value={props.data} paginator rows={60} rowsPerPageOptions={[5, 10, 25, 50]}
                       scrollable scrollHeight="calc(100vh - 320px)"
                       filterDisplay="row"
                       size="small"
            >
                <Column field="worldName" filter header="World" filterField="worldName"></Column>
                <Column field="territoryName" header="Area"></Column>
                <Column field="missingWards" header="Missing Wards"></Column>
            </DataTable>
        </div>
    </Sidebar>)
}