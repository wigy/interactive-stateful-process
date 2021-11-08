/**
 * A connector interface for fetching configuration values and sometimes for applying results.
 */
export interface ProcessConnector {
    initialize(server: unknown): Promise<void>;
    getConfig(section: string, name: string): Promise<unknown>;
    applyResult(args: unknown): Promise<void>;
    success(state: unknown): Promise<void>;
}
export declare const defaultConnector: {
    initialize(): Promise<void>;
    getConfig(section: string, name: string): Promise<unknown>;
    applyResult(): Promise<void>;
    success(): Promise<void>;
};
