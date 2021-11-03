import { Database, ID, ProcessConfig, ProcessName, ProcessStatus } from '..';
export declare type GetApiResponse = {
    id: ID;
    ownerId: ID;
    name: ProcessName;
    config: ProcessConfig;
    complete: boolean;
    successful?: boolean;
    currentStep?: number;
    maxSteps?: number;
    status: ProcessStatus;
    error?: string;
    created: Date;
};
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
