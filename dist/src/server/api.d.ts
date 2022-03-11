import { Database } from '../common';
import { ProcessModelData, ProcessModelDetailedData, ProcessStepModelData, ID } from 'interactive-elements';
export declare type ProcessApi = {
    process: {
        getAll: () => Promise<ProcessModelData>;
        get: (id: ID) => Promise<ProcessModelDetailedData>;
        getStep: (id: ID, step: number) => Promise<ProcessStepModelData>;
    };
};
/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function (db: Database): ProcessApi;
