import type {Callback} from "../../types.ts";
import {type AvailableTerritoryDto, type AvailableWorldDto, HousingTag, type SearchDto} from "../dto/dtos.ts";
import {useEffect, useState} from "react";
import {InputSwitch} from "primereact/inputswitch";
import {Paginator, type PaginatorPageChangeEvent} from "primereact/paginator";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import {MultiSelect} from "primereact/multiselect";

function WorldFilter(props: {selectedWorld: number | null, availableWorlds: AvailableWorldDto[], selectWorld: Callback<number>}) {
    return (<div className="flex flex-column">
        <label htmlFor="world-filter">Select World</label>
        <Dropdown
            value={props.selectedWorld}
            options={props.availableWorlds}
            showClear={true}
            onChange={(e) => props.selectWorld(e.value)}
            optionLabel="name"
            optionValue="id"
            id="world-filter"
            style={{width: "200px"}}
        />
    </div>)
}

function TerritoryFilter(props: {selectedTerritory: number | null, availableTerritories: AvailableWorldDto[], setSelectedTerritory: Callback<number>}) {
    return (<div className="flex flex-column">
        <label htmlFor="territory-filter">Select Area</label>
        <Dropdown
            id="territory-filter"
            value={props.selectedTerritory}
            options={props.availableTerritories}
            showClear={true}
            onChange={(e) => props.setSelectedTerritory(e.value)}
            optionLabel="name"
            optionValue="id"
            style={{width: "200px"}}
        />
    </div>)
}

function TextFilter(props: {inputId: string, text: string, setText: Callback<string>, placeholder: string}) {
    return (<div className="flex flex-column">
        <label htmlFor={props.inputId}>{props.placeholder}</label>
        <InputText style={{width: "200px"}} id={props.inputId} placeholder={props.placeholder} value={props.text}
                   onChange={(e) => props.setText(e.target.value)}/>
    </div>)
}

const availableTags: HousingTag[] = Object.keys(HousingTag).filter(value => isNaN(Number(value))) as HousingTag[];

function TagFilter(props: {inputId: string, selectedTags: HousingTag[], setSelectedTags: Callback<HousingTag[]>}) {
    return (<div className="flex flex-column">
        <label htmlFor={props.inputId}>Filter Tags</label>
        <MultiSelect style={{width: "300px"}} value={props.selectedTags} onChange={(e) => props.setSelectedTags(e.value)} options={availableTags}
                     placeholder="Select Tags" maxSelectedLabels={3} />
    </div>)
}

interface SearchBarProps {
    availableWorlds: AvailableWorldDto[];
    availableTerritories: AvailableTerritoryDto[];
    totalRecords: number;

    onSearchChange: Callback<SearchDto>;
}

export function SearchBar(props: SearchBarProps) {
    const [greetingSearch, setGreetingSearch] = useState<string>('');
    const [onwerSearch, setOwnerSearch] = useState<string>('');
    const [selectedWorld, setSelectedWorld] = useState<number | null>(403); // 403 = Raiden
    const [selectedTerritory, setSelectedTerritory] = useState<number | null>(null);
    const [onlyCollected, setOnlyCollected] = useState<boolean>(true);
    const [selectedTags, setSelectedTags] = useState<HousingTag[]>([]);

    const [page, setPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(60);

    useEffect(() => {
        const timeout = setTimeout(() => {
            buildAndSubmitSearch(pageSize, page);
        }, 500);
        return () => clearTimeout(timeout);
    }, [greetingSearch, onwerSearch, selectedWorld, selectedTerritory, onlyCollected, selectedTags]);

    function onPageChange(pageChange: PaginatorPageChangeEvent) {
        setPage(pageChange.page);
        setPageSize(pageChange.rows);
        buildAndSubmitSearch(pageChange.rows, pageChange.page);
    }

    function buildAndSubmitSearch(pageSize: number, page: number) {
        const searchDto: SearchDto = {
            owner: onwerSearch,
            isOpen: true,
            worldId: selectedWorld,
            greeting: greetingSearch,
            territoryId: selectedTerritory,
            wardNumber: null,
            onlyFilled: onlyCollected,
            tags: selectedTags,
            page: page,
            pageSize: pageSize
        }
        props.onSearchChange(searchDto)
    }

    return (<div style={{display: "flex", flexDirection: "row"}}>
        <div style={{marginRight: "8px"}}><WorldFilter availableWorlds={props.availableWorlds} selectedWorld={selectedWorld} selectWorld={setSelectedWorld}/></div>
        <div style={{marginRight: "8px"}}><TerritoryFilter availableTerritories={props.availableTerritories} selectedTerritory={selectedTerritory} setSelectedTerritory={setSelectedTerritory}/></div>
        <div style={{marginRight: "8px"}}><TextFilter inputId="owner-filter" text={onwerSearch} setText={setOwnerSearch} placeholder="Search Owner"/></div>
        <div style={{marginRight: "8px"}}><TextFilter inputId="greeting-filter" text={greetingSearch} setText={setGreetingSearch} placeholder="Search Greeting"/></div>
        <div style={{marginRight: "8px"}}><TagFilter inputId="tag-filter" selectedTags={selectedTags} setSelectedTags={setSelectedTags}/></div>
        <div style={{marginRight: "8px"}}>
            <div className="flex flex-column">
                <label htmlFor="only-collected">Only Already Collected</label>
                <InputSwitch style={{marginTop: "8px"}} inputId="only-collected" checked={onlyCollected} onChange={(e) => setOnlyCollected(e.value)} />
            </div>
        </div>
        <div style={{marginLeft: "auto"}}>
            <Paginator first={page * 60}
                       rows={pageSize}
                       totalRecords={props.totalRecords}
                       rowsPerPageOptions={[20, 30, 60, 120]}
                       onPageChange={onPageChange}
                       template={{ layout: 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown' }}
            />
        </div>
    </div>)
}