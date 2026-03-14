import MPAs from '../../../docs/data/context/MPA.json'
import { EContextLayerDatasets } from '../../enum/gfwEnum'
import { IContextLayer, IContextLayerEnrichment } from '../../types/eventTypes'
import { TGlobalEvent } from '../../types/gfwTypes'

export const generateMPA = (a_EventEntry: TGlobalEvent | undefined ): IContextLayer=> {    
    let contextLayer: IContextLayer = {
        dataset: EContextLayerDatasets.mpa,
        version: "v3",
        enrichments: []
    }
    if(!a_EventEntry) return contextLayer

    const mpas = a_EventEntry.regions.mpa
    
    if(mpas && mpas.length > 0){
        let enrichments : IContextLayerEnrichment[] = []
        for(const mpaId of mpas){

            const mpaEntry = MPAs.find( mpa => mpa.id === mpaId )
            if(mpaEntry && mpaEntry.label){

                enrichments.push({
                    id: String(mpaId),
                    label: mpaEntry.label
                })

            }

        }

        contextLayer.enrichments = enrichments
        
        return contextLayer
    } else {
        return contextLayer
    }
}