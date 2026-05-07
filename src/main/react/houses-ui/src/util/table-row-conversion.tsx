import type {SearchResultEntryDto} from "../dto/dtos.ts";
import type {PlotTableRow} from "../component/PlotTable.tsx";

export function mapRows(rows: SearchResultEntryDto[], favorites: number[]): PlotTableRow[] {
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