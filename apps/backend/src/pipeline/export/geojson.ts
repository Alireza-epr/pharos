import { FeatureCollection, IFeature, IGeometry } from "@packages/types";
import { fs_writeFileSync } from "./fs";

export const writeGeoJSON = <G extends IGeometry = IGeometry, P = any>(
    a_OutputPath: string,
    a_Features: IFeature<G, P>[]
) => {

    const featureCollection: FeatureCollection<G, P> = {
        type: "FeatureCollection",
        features: a_Features
    }

    fs_writeFileSync(a_OutputPath+".geojson", featureCollection);
}