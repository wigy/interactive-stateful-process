import { Directions } from "..";
import { ProcessFile } from "./ProcessFile";
import { ProcessStep } from "./ProcessStep";
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
