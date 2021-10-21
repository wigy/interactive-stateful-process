import { Directions } from './directions';
import { Database, TimeStamp, ID } from "./common";
export declare type ProcessTitle = string;
export declare type ProcessName = string;
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
/**
 * A basic information of the processing step.
 */
export interface ProcessStepData<VendorState> {
    processId?: ID;
    number: number;
    state: VendorState;
    handler: string;
    started?: TimeStamp;
    finished?: TimeStamp;
}
/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
export declare class ProcessStep<VendorElement, VendorState, VendorAction> {
    process: Process<VendorElement, VendorState, VendorAction>;
    id: ID;
    processId: ID;
    number: number;
    state: VendorState;
    handler: string;
    started: TimeStamp | undefined;
    finished: TimeStamp | undefined;
    directions: Directions<VendorElement, VendorAction>;
    action: VendorAction;
    constructor(obj: ProcessStepData<VendorState>);
    /**
     * Get a reference to the database.
     */
    get db(): Database;
    /**
     * Save the process info to the database.
     */
    save(): Promise<ID>;
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON(): ProcessStepData<VendorState>;
    setDirections(db: Database, directions: Directions<VendorElement, VendorAction>): Promise<void>;
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
export declare class Process<VendorElement, VendorState, VendorAction> {
    system: ProcessingSystem<VendorElement, VendorState, VendorAction>;
    id: ID;
    name: ProcessName;
    complete: boolean;
    successful: boolean | undefined;
    currentStep: number | undefined;
    files: ProcessFile[];
    steps: ProcessStep<VendorElement, VendorState, VendorAction>[];
    constructor(system: ProcessingSystem<VendorElement, VendorState, VendorAction>, name: ProcessName | null);
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
     * Append a step to this process and link its ID. Increase current step.
     * @param step
     */
    addStep(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<void>;
    /**
     * Get a reference to the database.
     */
    get db(): Database;
    /**
     * Save the process info to the database.
     */
    save(): Promise<ID>;
}
/**
 * A handler taking care of moving between process states.
 */
export declare class ProcessHandler<VendorElement, VendorState, VendorAction> {
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
    /**
     * Figure out possible directions from the given state.
     * @param state
     */
    getDirections(state: VendorState): Promise<Directions<VendorElement, VendorAction>>;
}
/**
 * A collection of process handlers.
 */
export declare type ProcessHandlerMap<VendorElement, VendorState, VendorAction> = {
    [key: string]: ProcessHandler<VendorElement, VendorState, VendorAction>;
};
/**
 * An instance of the full processing system.
 */
export declare class ProcessingSystem<VendorElement, VendorState, VendorAction> {
    db: Database;
    handlers: ProcessHandlerMap<VendorElement, VendorState, VendorAction>;
    /**
     * Initialize the system and set the database instance for storing process data.
     * @param db
     */
    constructor(db: Database);
    /**
     * Register new handler class for processing.
     * @param handler
     */
    register(handler: ProcessHandler<VendorElement, VendorState, VendorAction>): void;
    /**
     * Initialize new process and save it to the database.
     * @param type
     * @param name
     * @param file
     * @returns
     */
    createProcess(name: ProcessName, file: ProcessFileData): Promise<Process<VendorElement, VendorState, VendorAction>>;
    run(process: Process<VendorElement, VendorState, VendorAction>): void;
}
