import { Database } from '../common';
import { GetApiResponse, ID } from 'interactive-elements';
export declare type ProcessApi = {
    process: {
        getAll: () => Promise<GetApiResponse[]>;
        get: (id: ID) => Promise<GetApiResponse>;
    };
};
/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function (db: Database): ProcessApi;
