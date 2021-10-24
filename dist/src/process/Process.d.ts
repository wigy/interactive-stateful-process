import { Database, ID, ProcessName, ProcessStatus } from "..";
import { ProcessFile } from "./ProcessFile";
import { ProcessingSystem } from "./ProcessingSystem";
import { ProcessStep } from "./ProcessStep";
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
     * Check if the process can be run.
     */
    canRun(): boolean;
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
