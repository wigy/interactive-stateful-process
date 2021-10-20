import { Origin } from "./origin";
import { Directions } from './directions';
import { Action } from "./action";
import { Database, TimeStamp, ID } from "./common";
export declare type ProcessTitle = string;
export declare type ProcessName = string;
export declare type ProcessType = 'web' | 'database' | 'calculation';
export declare type FileEncoding = 'ascii' | 'base64' | 'json';
/**
 * A data structure containing file data.
 */
export interface ProcessFileData {
    processId?: ID;
    name: string;
    encoding: FileEncoding;
    data: string;
}
/**
 * An instance of file data for processing.
 */
export declare class ProcessFile {
    id: ID;
    processId: ID;
    name: string;
    encoding: FileEncoding;
    data: string;
    constructor(obj: ProcessFileData);
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
export interface ProcessStepData<VendorElementType, VendorState, VendorActionData> {
    directions: Directions<VendorElementType, VendorActionData>;
    action: Action<VendorActionData>;
    number: number;
    started: TimeStamp;
    state: VendorState;
    finished: TimeStamp;
}
export declare class ProcessStep<VendorElementType, VendorState, VendorActionData> {
    directions: Directions<VendorElementType, VendorActionData>;
    action: Action<VendorActionData>;
    number: number;
    started: TimeStamp;
    state: VendorState;
    finished: TimeStamp;
    constructor(obj: ProcessStepData<VendorElementType, VendorState, VendorActionData>);
}
/**
 * Overall description of the process.
 */
export interface ProcessInfo {
    name: ProcessName;
    complete: boolean;
    successful: boolean | undefined;
    currentStep: number | undefined;
}
/**
 * A complete description of the process state and steps taken.
 */
export declare class Process<VendorElementType, VendorState, VendorActionData> {
    id: ID;
    name: ProcessName;
    complete: boolean;
    successful: boolean | undefined;
    currentStep: number | undefined;
    files: ProcessFile[];
    steps: ProcessStep<VendorElementType, VendorState, VendorActionData>[];
    constructor(name: ProcessName | null);
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON(): ProcessInfo;
    /**
     * Append a file to this process and link its ID.
     * @param file
     */
    addFile(file: ProcessFile): void;
    /**
     * Save the process info to the database.
     */
    save(db: Database): Promise<ID>;
    load(db: Database, id: ID): Promise<Process<VendorElementType, VendorState, VendorActionData>>;
    loadCurrentStep(db: Database): Promise<ProcessStep<VendorElementType, VendorState, VendorActionData>>;
}
/**
 * A handler taking care of moving between process states.
 */
export declare class ProcessHandler<VendorElementType, VendorState, VendorActionData> {
    name: string;
    constructor(name: string);
    /**
     * Check if we are able to handle the given data.
     * @param file
     */
    canHandle(file: ProcessFile): boolean;
    /**
     * Construct intial state from the given data.
     * @param file
     */
    startingState(file: ProcessFile): VendorState;
    startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData> | null;
}
/**
 * A collection of process handlers.
 */
export declare type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>;
};
/**
 * An instance of the full processing system.
 */
export declare class ProcessingSystem<VendorElementType, VendorState, VendorActionData> {
    db: Database;
    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData>;
    /**
     * Initialize the system and set the database instance for storing process data.
     * @param db
     */
    constructor(db: Database);
    /**
     * Register new handler class for processing.
     * @param handler
     */
    register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void;
    /**
     * Initialize new process and save it to the database.
     * @param type
     * @param name
     * @param file
     * @returns
     */
    createProcess(type: ProcessType, name: ProcessName, file: ProcessFileData): Promise<Process<VendorElementType, VendorState, VendorActionData>>;
    startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData>[];
    getHandler(name: ProcessName): ProcessHandler<VendorElementType, VendorState, VendorActionData>;
    OldcreateProcess(type: ProcessType, name: ProcessName, origin: Origin): void;
}
