import { Database, FileEncoding, ID } from "..";
/**
 * A data structure containing input data for the process.
 */
export interface ProcessFileData {
    processId?: ID;
    name: string;
    type?: string;
    encoding: FileEncoding;
    data: string;
}
/**
 * An instance of input data for processing.
 */
export declare class ProcessFile {
    id: ID;
    processId: ID;
    name: string;
    type?: string;
    encoding: FileEncoding;
    data: string;
    constructor(obj: ProcessFileData);
    toString(): string;
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON(): ProcessFileData;
    /**
     * Save the file to the database.
     */
    save(db: Database): Promise<ID>;
}
