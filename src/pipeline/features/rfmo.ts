import RFMOs from '../../../docs/data/context/RFMO.json'
import { EContextLayerDatasets } from '../../enum/gfwEnum'
import { IContextLayer, IContextLayerEnrichment } from '../../types/eventTypes'
import { TGlobalEvent } from '../../types/gfwTypes'

export const generateRFMO = (a_EventEntry: TGlobalEvent | undefined ): IContextLayer=> {    
    let contextLayer: IContextLayer = {
        dataset: EContextLayerDatasets.rfmo,
        version: "v3",
        enrichments: []
    }
    if(!a_EventEntry) return contextLayer

    const rfmos = a_EventEntry.regions.rfmo
    
    if(rfmos && rfmos.length > 0){
        let enrichments : IContextLayerEnrichment[] = []
        for(const rfmoId of rfmos){

            const mpaEntry = RFMOs.find( rfmo => rfmo.id === rfmoId )
            if(mpaEntry && mpaEntry.label){

                enrichments.push({
                    id: String(rfmoId),
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