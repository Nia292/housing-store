import {AutoComplete, type AutoCompleteCompleteEvent, type AutoCompleteSelectEvent} from "primereact/autocomplete";
import type {Callback} from "../../types.ts";
import {ToggleButton} from "primereact/togglebutton";
import {useRef, useState} from "react";
import {OverlayPanel} from "primereact/overlaypanel";
import {ListBox} from "primereact/listbox";

export interface GlobalSearchProps {
    searchTerms: string[];
    and: boolean;
    onSearchTermsChange: Callback<string[]>;
    onAndChange: Callback<boolean>
}

const wardSearches = Array.from(Array(60).keys())
    .map(v => ({label: 'Ward ' + (v + 1), value: (v + 1)}));
const plotSearches = Array.from(Array(60).keys())
    .map(v => ({label: 'Plot ' + (v + 1), value: (v + 1)}));

const searchPhrases = ['owner:', 'not:', 'status:collected', 'status:open', 'status:closed', 'status:collected-greeting', 'ward:', 'plot:'];

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
    const autocomplete = useRef<AutoComplete>(null);

    function search(event: AutoCompleteCompleteEvent) {
        setSuggestions(renderSuggestions(event.query));
    }

    const itemTemplate = (item: string) => {
        const split = item.split(":");
        if (split.length >= 2) {
            return <span><span
                style={{fontWeight: "bolder", color: "lightgrey"}}>{split[0]}:</span><span>{split[1]}</span></span>
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
        } else {
            props.onSearchTermsChange([...props.searchTerms, event.value])
        }

    }

    function handleUnselect(value: string): void {
        props.onSearchTermsChange(props.searchTerms.filter(v => v !== value));
    }

    function handleSelectWard(ward: number): void {
        props.onSearchTermsChange([...props.searchTerms, `ward: ${ward}`])
        overlayPanelWards.current?.toggle(null);
    }

    function handleSelectPlot(ward: number): void {
        props.onSearchTermsChange([...props.searchTerms, `plot: ${ward}`])
        overlayPanelPlots.current?.toggle(null);
    }


    const listBoxWidth = autocomplete.current?.getElement()?.getBoundingClientRect().width ?? 400;

    return (<div className="flex flex-column">
        <label htmlFor="global-search">Filter</label>
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
            <ToggleButton
                checked={props.and}
                onChange={(e) => props.onAndChange(e.value)}
                onLabel="∧" offLabel="∨"
                tooltip={props.and ? 'Matching all terms conjunctive (boolean and)' : 'Matching all terms disjunctive (boolean or)'}
            />
        </div>
    </div>)
}