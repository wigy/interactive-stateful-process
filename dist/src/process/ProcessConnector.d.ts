import { ID } from "interactive-elements";
/**
 * A connector interface for querying information, applying results and running various hooks.
 */
export interface ProcessConnector {
    initialize(server: unknown): Promise<void>;
    getTranslation(text: string, language: string): Promise<string>;
    applyResult(processId: ID, args: unknown): Promise<void>;
    success(state: unknown): Promise<void>;
}
export declare const defaultConnector: {
    initialize(): Promise<void>;
    applyResult(): Promise<void>;
    success(): Promise<void>;
    getTranslation(text: string): Promise<string>;
};
