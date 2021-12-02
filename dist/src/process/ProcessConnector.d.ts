/**
 * A connector interface for fetching configuration values and sometimes for applying results.
 */
export interface ProcessConnector {
    initialize(server: unknown): Promise<void>;
    getTranslation(text: string, language: string): Promise<string>;
    applyResult(args: unknown): Promise<void>;
    success(state: unknown): Promise<void>;
}
export declare const defaultConnector: {
    initialize(): Promise<void>;
    applyResult(): Promise<void>;
    success(): Promise<void>;
    getTranslation(text: string): Promise<string>;
};
