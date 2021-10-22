import { Directions } from './directions';
import { Database, ID } from "./common";
/**
 * The name of the process.
 */
export declare type ProcessName = string;
/**
 * How the process input data is encoded.
 */
export declare type FileEncoding = 'ascii' | 'base64' | 'json';
/**
 * Overall status of the process.
 *
 *  * INCOMPLETE - Something has stopped the process before it has been finished properly.
 *  * WAITING - The process is currently waiting for external input.
 *  * SUCCEEDED - The process is completed successfully.
 *  * FAILED - The process is completed unsuccessfully.
 *  * CRASHED - A handler has crashed at some point and process is halted.
 *
 */
export declare enum ProcessStatus {
    INCOMPLETE = "INCOMPLETE",
    WAITING = "WAITING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    CRASHED = "CRASHED"
}
/**
 * A data structure containing input data for the process.
 */
export interface ProcessFileData {
    processId?: ID;
    name: string;
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
/**
 * A basic information of the processing step.
 */
export interface ProcessStepData<VendorElement, VendorState, VendorAction> {
    processId?: ID;
    number: number;
    state: VendorState;
    handler: string;
    action?: VendorAction;
    directions?: Directions<VendorElement, VendorAction>;
    started?: Date;
    finished?: Date;
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
    started: Date | undefined;
    finished: Date | undefined;
    directions?: Directions<VendorElement, VendorAction>;
    action?: VendorAction | undefined;
    constructor(obj: ProcessStepData<VendorElement, VendorState, VendorAction>);
    toString(): string;
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
    toJSON(): ProcessStepData<VendorElement, VendorState, VendorAction>;
    /**
     * Set directions and update database.
     * @param db
     * @param directions
     */
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
    status: ProcessStatus;
    error?: string;
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
    status: ProcessStatus;
    files: ProcessFile[];
    steps: ProcessStep<VendorElement, VendorState, VendorAction>[];
    error: string | undefined;
    constructor(system: ProcessingSystem<VendorElement, VendorState, VendorAction>, name: ProcessName | null);
    toString(): string;
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
     * Append a step to this process and link its ID.
     * @param step
     */
    addStep(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<void>;
    /**
     * Load the current step if necessary and return it.
     */
    getCurrentStep(): Promise<ProcessStep<VendorElement, VendorState, VendorAction>>;
    /**
     * Mark the current state as completed and create new additional step with the new state.
     * @param state
     */
    proceedToState(action: VendorAction, state: VendorState): Promise<void>;
    /**
     * Get a reference to the database.
     */
    get db(): Database;
    /**
     * Save the process info to the database.
     */
    save(): Promise<ID>;
    /**
     * Load the process data and its files. Note that current step is not yet loaded here, but when using getCurrentStep().
     * @param id
     */
    load(id: ID): Promise<void>;
    /**
     * Load the step with the given number from the database.
     * @param number
     * @returns
     */
    loadStep(number: number): Promise<ProcessStep<VendorElement, VendorState, VendorAction>>;
    /**
     * Execute process as long as it is completed, failed or requires additional input.
     */
    run(): Promise<void>;
    /**
     * Record the error and mark the process as finished with an error.
     * @param err
     */
    crashed(err: Error): Promise<void>;
    /**
     * Resolve the status of the process and update it to the database.
     */
    updateStatus(): Promise<void>;
    /**
     * Get the state of the current step of the process.
     */
    get state(): VendorState;
    /**
     * Handle external input coming ing.
     * @param action
     */
    input(action: VendorAction): Promise<void>;
    /**
     * Roll back the latest step.
     */
    rollback(): Promise<boolean>;
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
     * Check if the state is either successful `true` or failed `false` or not yet complete `undefined`.
     * @param state
     */
    checkCompletion(state: VendorState): boolean | undefined;
    /**
     * Execute an action to the state in order to produce new state. Note that state is cloned and can be modified to be new state.
     * @param action
     * @param state
     * @param files
     */
    action(action: VendorAction, state: VendorState, files: ProcessFile[]): Promise<VendorState>;
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
    /**
     * See if it is possible rollback a step.
     * @param step
     */
    rollback(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<boolean>;
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
    logger: {
        info: (...msg: any[]) => void;
        error: (...msg: any[]) => void;
    };
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
    /**
     * Check if we are in the finished state and if not, find the directions forward.
     */
    checkFinishAndFindDirections(handler: ProcessHandler<VendorElement, VendorState, VendorAction>, step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<void>;
    /**
     * Get the named handler or throw an error if not registered.
     * @param name
     * @returns
     */
    getHandler(name: string): ProcessHandler<VendorElement, VendorState, VendorAction>;
    /**
     * Load the process data from the disk.
     * @param id
     * @returns
     */
    loadProcess(id: ID): Promise<Process<VendorElement, VendorState, VendorAction>>;
}
