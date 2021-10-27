import { ProcessConnector, ProcessHandler } from '..';
/**
 * Simple demo server.
 */
export declare class ISPDemoServer<DemoElement, DemoState, DemoAction> {
    private app;
    private server;
    private port;
    private db;
    private handlers;
    private connector;
    constructor(port: number, databaseUrl: string, handlers: ProcessHandler<DemoElement, DemoState, DemoAction>[], connector?: ProcessConnector | null);
    start: () => Promise<void>;
}
