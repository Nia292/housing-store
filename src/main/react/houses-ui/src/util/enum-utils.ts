import {HousingTag} from "../dto/dtos.ts";

const tagMap: Partial<Record<HousingTag, string>> = {
    [HousingTag.DesignerHome]: "Designer Home",
    [HousingTag.MessageBook]: "Message Book",
    [HousingTag.ImmersiveExperience]: "Immersive Experience",
    [HousingTag.PhotoStudio]: "Photo Studio",
    [HousingTag.HauntedHouse]: "Haunted House",
    [HousingTag.FarEastern]: "Far Eastern",
    [HousingTag.VisitorsWelcome]: "Visitors Welcome",
    [HousingTag.UnderConstruction]: "Under Construction",
    [HousingTag.ConcertHall]: "Concert Hall",
}

function translateHousingTag(tag: HousingTag): string {
    return tagMap[tag] ?? tag;
}

export interface SelectableTag {
    label: string;
    value: HousingTag;
}

export function getHousingTagFilters(): SelectableTag[] {
    const availableTags: HousingTag[] = Object.keys(HousingTag).filter(value => isNaN(Number(value))) as HousingTag[];

    return availableTags.map(value => ({
        value,
        label: translateHousingTag(value)
    })).toSorted((a, b) => a.label.localeCompare(b.label))
}