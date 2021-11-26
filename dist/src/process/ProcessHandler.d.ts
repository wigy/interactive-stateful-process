import { Directions } from "..";
import { ProcessFile } from "./ProcessFile";
import { ProcessStep } from "./ProcessStep";
import { ProcessingSystem } from "./ProcessingSystem";
import { ProcessConfigSection } from "./ProcessConnector";
import { ProcessConfig } from "interactive-elements";
import { Process } from "./Process";
/**
 * A handler taking care of moving between process states.
 */
export declare class ProcessHandler<VendorElement, VendorState, VendorAction> {
    system: ProcessingSystem<VendorElement, VendorState, VendorAction>;
    name: string;
    constructor(name: string);
    /**
     * Attach this handler to the processing system during the registration.
     * @param system
     */
    connect(system: ProcessingSystem<VendorElement, VendorState, VendorAction>): void;
    /**
     * Get the value from the system configuration.
     */
    getConfig(section: ProcessConfigSection, name: string): Promise<unknown>;
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
    action(process: Process<VendorElement, VendorState, VendorAction>, action: VendorAction, state: VendorState, files: ProcessFile[]): Promise<VendorState>;
    /**
     * Construct intial state from the given data.
     * @param file
     */
    startingState(file: ProcessFile): VendorState;
    /**
     * Figure out possible directions from the given state.
     * @param state
     */
    getDirections(state: VendorState, config: ProcessConfig): Promise<Directions<VendorElement, VendorAction>>;
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
