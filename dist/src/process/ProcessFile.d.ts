/// <reference types="node" />
import { Database } from "..";
import { FileEncoding, ID } from 'interactive-elements';
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
    private decoded?;
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
    /**
     * Check if the first line of the text file matches to the regular expression.
     * @param re
     */
    firstLineMatch(re: RegExp): boolean;
    /**
     * Find out if the content is binary or text.
     *
     * The mime type has to start with `text/`.
     */
    isTextFile(): boolean;
    /**
     * Convert chardet encoding to the supported buffer encoding
     * "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
     */
    parseEncoding(encoding: string): BufferEncoding;
    /**
     * Try to recognize the file content and decode if it is a recognizable text format.
     */
    decode(): string;
}
