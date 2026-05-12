import { deepSortObject } from '@packages/utils';
import fs from 'fs';

export const fs_writeFileSync = (
    a_OutputPath: string,
    a_Data: any,
    a_Replacer: (string | number)[] | null | undefined = null,
    a_Space: number = 2,
    a_Options?: fs.WriteFileOptions
) => {

    fs.writeFileSync(
        a_OutputPath,
        JSON.stringify(deepSortObject(a_Data), a_Replacer, a_Space),
        a_Options
    );

};

export const fs_readFileSync = <T = any>(
    a_InputPath: string,
): T => {

    const rawData = fs.readFileSync(a_InputPath, "utf8");

    return deepSortObject(JSON.parse(rawData)) as T;
};