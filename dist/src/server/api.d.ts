import { Database, ID } from "..";
/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function (db: Database): {
    process: {
        get: (id?: ID) => Promise<any>;
    };
};
