import { ProcessHandler } from '..';
/**
 * Simple demo server.
 */
export declare class ISPDemoServer<DemoElement, DemoState, DemoAction> {
    private app;
    private server;
    private port;
    private db;
    private handlers;
    constructor(port: number, databaseUrl: string, handlers?: ProcessHandler<DemoElement, DemoState, DemoAction>[]);
    start: () => Promise<void>;
}
