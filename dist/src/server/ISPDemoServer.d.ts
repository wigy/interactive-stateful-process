import { ProcessConnector, ProcessHandler } from '..';
/**
 * Simple demo server.
 *
 * TODO: Usage instructions from example.
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
    stop: (err?: Error | undefined) => Promise<void>;
}
