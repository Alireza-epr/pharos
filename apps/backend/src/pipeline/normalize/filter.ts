import { IEventSchema, IFilteringParams } from "@packages/types";


export const applyFilter = (a_Events: IEventSchema[], a_Filters: IFilteringParams): IEventSchema[] => {
    let filteredEvents = a_Events

    if (a_Filters.triage_score_min !== undefined) {
        const min = a_Filters.triage_score_min
        filteredEvents = filteredEvents.filter(e =>
            e.scoring.triage_score !== undefined && e.scoring.triage_score !== null &&
            (e.scoring.triage_score >= min)
        )
    }

    if (a_Filters.triage_score_max !== undefined) {
        const max = a_Filters.triage_score_max
        filteredEvents = filteredEvents.filter(e =>
            e.scoring.triage_score !== undefined && e.scoring.triage_score !== null &&
            (e.scoring.triage_score <= max)
        )
    }

    if (a_Filters.uncertainty_score_min !== undefined) {
        const min = a_Filters.uncertainty_score_min
        filteredEvents = filteredEvents.filter(e =>
            e.scoring.uncertainty_score !== undefined && e.scoring.uncertainty_score !== null &&
            (e.scoring.uncertainty_score >= min)
        )
    }

    if (a_Filters.uncertainty_score_max !== undefined) {
        const max = a_Filters.uncertainty_score_max
        filteredEvents = filteredEvents.filter(e =>
            e.scoring.uncertainty_score !== undefined && e.scoring.uncertainty_score !== null &&
            (e.scoring.uncertainty_score <= max)
        )
    }

    if (a_Filters.distance_to_coast_km_min !== undefined) {
        const min = a_Filters.distance_to_coast_km_min
        filteredEvents = filteredEvents.filter(e => e.distance_to_coast_km >= min)
    }

    if (a_Filters.distance_to_coast_km_max !== undefined) {
        const max = a_Filters.distance_to_coast_km_max
        filteredEvents = filteredEvents.filter(e => e.distance_to_coast_km <= max)
    }

    if (a_Filters.reason_codes_include !== undefined) {
        filteredEvents = filteredEvents.filter(event =>
            a_Filters.reason_codes_include!.some(reason =>
                event.scoring.reason_codes?.includes(reason)
            )
        )
    }

    if (a_Filters.reason_codes_exclude !== undefined) {
        filteredEvents = filteredEvents.filter(event =>
            !a_Filters.reason_codes_exclude!.some(reason =>
                event.scoring.reason_codes?.includes(reason)
            )
        )
    }

    if (a_Filters.is_inside_eez !== undefined) {
        filteredEvents = filteredEvents.filter(
            e =>
                (e.context_layers.EEZ.enrichments.length > 0) ===
                a_Filters.is_inside_eez
        )
    }

    if (a_Filters.is_inside_mpa !== undefined) {
        filteredEvents = filteredEvents.filter(
            e =>
                (e.context_layers.MPA.enrichments.length > 0) ===
                a_Filters.is_inside_mpa
        )
    }

    if (a_Filters.bathymetry_min !== undefined) {
        const min = a_Filters.bathymetry_min;

        filteredEvents = filteredEvents.filter(event => {
            const bathymetry = Number(
                event.context_layers.Bathymetry.enrichments[0]?.value
            );

            return !Number.isNaN(bathymetry) && bathymetry >= min;
        });
    }

    if (a_Filters.bathymetry_max !== undefined) {
        const max = a_Filters.bathymetry_max;

        filteredEvents = filteredEvents.filter(event => {
            const bathymetry = Number(
                event.context_layers.Bathymetry.enrichments[0]?.value
            );

            return !Number.isNaN(bathymetry) && bathymetry <= max;
        });
    }

    return filteredEvents
}