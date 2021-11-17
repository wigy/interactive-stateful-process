import { Database } from '../common';
import { GetAllProcessesApiResponse, GetOneProcessResponse, ID } from 'interactive-elements';
export declare type ProcessApi = {
    process: {
        getAll: () => Promise<GetAllProcessesApiResponse>;
        get: (id: ID) => Promise<GetOneProcessResponse>;
        getStep: (id: ID, step: number) => Promise<any>;
    };
};
/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function (db: Database): ProcessApi;
