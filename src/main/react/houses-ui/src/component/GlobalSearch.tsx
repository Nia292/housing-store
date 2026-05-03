import {AutoComplete, type AutoCompleteCompleteEvent, type AutoCompleteSelectEvent} from "primereact/autocomplete";
import type {Callback} from "../../types.ts";
import {ToggleButton} from "primereact/togglebutton";
import {useRef, useState} from "react";
import {OverlayPanel} from "primereact/overlaypanel";
import {ListBox} from "primereact/listbox";
import type {AvailableTerritoryDto} from "../dto/dtos.ts";

export interface GlobalSearchProps {
    searchTerms: string[];
    and: boolean;
    availableTerritories: AvailableTerritoryDto[];

    onSearchTermsChange: Callback<string[]>;
    onAndChange: Callback<boolean>
}

const wardSearches = Array.from(Array(60).keys())
    .map(v => ({label: 'Ward ' + (v + 1), value: (v + 1)}));
const plotSearches = Array.from(Array(60).keys())
    .map(v => ({label: 'Plot ' + (v + 1), value: (v + 1)}));
const statusSearches = [
    {label: <span><span className="font-bold">Collected</span> - Owner, tags and meta information has been collected</span>, value: 'collected'},
    {label: <span><span className="font-bold">Collected Greeting</span> - The greeting text for this plot has been collected</span>, value: 'collected-greeting'},
    {label: <span><span className="font-bold">Open</span> - Owner allows visitors in this house</span>, value: 'open'},
    {label: <span><span className="font-bold">Closed</span> - Owner does not allow visitors in this house</span>, value: 'closed'},
    {label: <span><span className="font-bold">Misses Greeting</span> - Basic information has been collected, but the greeting text is missing</span>, value: 'misses-greeting'},
]

const searchPhrases = ['area:', 'owner:', 'not:', 'status:', 'ward:', 'plot:', 'fuzzy:', 'phrase:'];

function onlyUnique<T>(value: T, index: number, array: T[]): boolean {
    return array.indexOf(value) === index;
}

function renderSuggestions(keyword: string) {
    if (keyword === "") {
        return [...searchPhrases]
    }
    var matchingKeywords = searchPhrases.filter(value => value.startsWith(keyword));
    if (matchingKeywords.length > 0) {
        return matchingKeywords;
    }
    return [
        keyword
    ].filter(onlyUnique);
}

export function GlobalSearch(props: GlobalSearchProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const overlayPanelWards = useRef<OverlayPanel>(null);
    const listBoxWards = useRef<ListBox>(null);

    const overlayPanelPlots = useRef<OverlayPanel>(null);
    const listBoxPlots = useRef<ListBox>(null);

    const overlayPanelStatus = useRef<OverlayPanel>(null);
    const listBoxStatus = useRef<ListBox>(null);

    const overlayPanelTerritory = useRef<OverlayPanel>(null);
    const listBoxTerritory = useRef<ListBox>(null);

    const autocomplete = useRef<AutoComplete>(null);

    function search(event: AutoCompleteCompleteEvent) {
        setSuggestions(renderSuggestions(event.query));
    }

    const itemTemplate = (item: string) => {
        const split = item.split(":");
        const key = split[0];
        const value = split[1];
        if (split.length >= 2) {
            return (<span>
                <span style={{fontWeight: "bolder", color: "lightgrey"}}>{key}:</span><span>{value}</span>
            </span>)
        }
        return item;
    };

    function handleSelect(event: AutoCompleteSelectEvent<string>): void {
        if (event.value === 'ward:') {
            overlayPanelWards?.current?.toggle(event.originalEvent, autocomplete.current?.getElement())
            setTimeout(() => listBoxWards.current?.focus(), 20);
        } else if (event.value === 'plot:') {
            overlayPanelPlots?.current?.toggle(event.originalEvent, autocomplete.current?.getElement())
            setTimeout(() => listBoxPlots.current?.focus(), 20);
        } else if (event.value === 'status:') {
            overlayPanelStatus?.current?.toggle(event.originalEvent, autocomplete.current?.getElement())
            setTimeout(() => listBoxStatus.current?.focus(), 20);
        } else if (event.value === 'area:') {
            overlayPanelTerritory?.current?.toggle(event.originalEvent, autocomplete.current?.getElement())
            setTimeout(() => listBoxTerritory.current?.focus(), 20);
        } else {
            props.onSearchTermsChange([...props.searchTerms, event.value])
        }
    }

    function handleUnselect(value: string): void {
        props.onSearchTermsChange(props.searchTerms.filter(v => v !== value));
    }

    function handleSelectWard(ward: number): void {
        props.onSearchTermsChange([...props.searchTerms, `ward: ${ward}`])
        overlayPanelWards.current?.hide();
    }

    function handleSelectPlot(ward: number): void {
        props.onSearchTermsChange([...props.searchTerms, `plot: ${ward}`])
        overlayPanelPlots.current?.hide();
    }

    function handleSelectStatus(status: string): void {
        props.onSearchTermsChange([...props.searchTerms, `status: ${status}`])
        overlayPanelStatus.current?.hide();
    }

    function handleSelectTerritory(territory: string): void {
        props.onSearchTermsChange([...props.searchTerms, `area: ${territory}`])
        overlayPanelTerritory.current?.hide();
    }


    const listBoxWidth = autocomplete.current?.getElement()?.getBoundingClientRect().width ?? 400;

    return (<div className="flex flex-column">
        <label htmlFor="global-search">Search Houses</label>
        <div>
            <AutoComplete
                ref={autocomplete}
                multiple
                inputStyle={{minWidth: "400px"}}
                value={props.searchTerms}
                suggestions={suggestions}
                completeMethod={search}
                delay={0}
                onSelect={(e) => handleSelect(e)}
                onUnselect={(e) => handleUnselect(e.value)}
                itemTemplate={itemTemplate}
                dropdown={true}
            />
            <OverlayPanel ref={overlayPanelWards} style={{width: listBoxWidth + 'px'}} >
                <ListBox
                    ref={listBoxWards}
                    onChange={(e) => handleSelectWard(e.value)}
                    style={{maxHeight: "600px", overflow: "auto"}}
                    options={wardSearches} optionLabel="label"
                />
            </OverlayPanel>
            <OverlayPanel ref={overlayPanelPlots} style={{width: listBoxWidth + 'px'}} >
                <ListBox
                    ref={listBoxPlots}
                    onChange={(e) => handleSelectPlot(e.value)}
                    style={{maxHeight: "600px", overflow: "auto"}}
                    options={plotSearches} optionLabel="label"
                />
            </OverlayPanel>
            <OverlayPanel ref={overlayPanelStatus} style={{width: listBoxWidth + 'px'}} >
                <ListBox
                    ref={listBoxStatus}
                    onChange={(e) => handleSelectStatus(e.value)}
                    style={{maxHeight: "600px", overflow: "auto"}}
                    options={statusSearches} optionLabel="label"
                />
            </OverlayPanel>
            <OverlayPanel ref={overlayPanelTerritory} style={{width: listBoxWidth + 'px'}} >
                <ListBox
                    ref={listBoxTerritory}
                    onChange={(e) => handleSelectTerritory(e.value)}
                    style={{maxHeight: "600px", overflow: "auto"}}
                    options={props.availableTerritories} optionLabel="name" optionValue="id"
                />
            </OverlayPanel>
            <ToggleButton
                checked={props.and}
                onChange={(e) => props.onAndChange(e.value)}
                onLabel="∧" offLabel="∨"
                tooltip={props.and ? 'Matching all terms conjunctive (boolean and)' : 'Matching all terms disjunctive (boolean or)'}
            />
        </div>
    </div>)
}