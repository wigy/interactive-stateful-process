import { Database, Directions, ID } from "..";
import { Process } from "./Process";
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
