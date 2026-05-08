import { IContextLayer } from "@packages/types";
import { getEEZContext } from "../../src/pipeline/features/eez";
import { getMPAContext } from "../../src/pipeline/features/mpa";
import { EContextLayerDatasets } from "@packages/enum";

jest.mock('parquetjs', () => ({
    __esModule: true,
    default: {
        ParquetSchema: jest.fn(),
    },
}));

jest.mock('@dotenvx/dotenvx', () => ({
    config: jest.fn(),
}));

jest.mock('@turf/turf', () => ({
    config: jest.fn(),
}));

jest.mock('geotiff', () => ({
    config: jest.fn(),
}));

//replaces the real functions with a fake Jest mock function
jest.mock('../../src/pipeline/features/eez', () => ({
    getEEZContext: jest.fn(),
}));
//define fixed mock return value
export const mockEEZContext = () => {
    (getEEZContext as jest.Mock).mockReturnValue({
        dataset: EContextLayerDatasets.eez,
        version: 'v12',
        enrichments: [
            {
                id: '5674',
                label: 'Danish Exclusive Economic Zone',
            },
        ],
    } as IContextLayer);
};

jest.mock('../../src/pipeline/features/mpa', () => ({
    getMPAContext: jest.fn(),
}));
export const mockMPAContext = () => {
    (getMPAContext as jest.Mock).mockReturnValue({
        dataset: 'WDPA_WDOECM_APR2026',
        version: 'v1.6',
        enrichments: [
            {
                id: '555774273',
                label: 'I',
            },
        ],
    } as IContextLayer);
};
