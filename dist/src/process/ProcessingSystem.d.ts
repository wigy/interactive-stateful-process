import { Database } from "..";
import { ID, ProcessName, ProcessConfig } from 'interactive-elements';
import { Process } from "./Process";
import { ProcessFileData } from "./ProcessFile";
import { ProcessStep } from "./ProcessStep";
import { ProcessHandler, ProcessHandlerMap } from "./ProcessHandler";
import { ProcessConnector } from "./ProcessConnector";
/**
 * An instance of the full processing system.
 */
export declare class ProcessingSystem<VendorElement, VendorState, VendorAction> {
    db: Database;
    handlers: ProcessHandlerMap<VendorElement, VendorState, VendorAction>;
    connector: ProcessConnector;
    logger: {
        info: (...msg: any[]) => void;
        error: (...msg: any[]) => void;
    };
    /**
     * Initialize the system and set the database instance for storing process data.
     * @param db
     */
    constructor(db: Database, connector: ProcessConnector);
    /**
     * Get the translation from the connector.
     * @param language
     * @param text
     * @returns
     */
    getTranslation(text: string, language: string): Promise<string>;
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
     * @returns New process that is already in crashed state, if no handler
     */
    createProcess(name: ProcessName, files: ProcessFileData[], config: ProcessConfig): Promise<Process<VendorElement, VendorState, VendorAction>>;
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
