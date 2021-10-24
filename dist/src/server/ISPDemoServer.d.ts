/**
 * Simple demo server.
 */
export declare class ISPDemoServer<DemoElement, DemoState, DemoAction> {
    private app;
    private server;
    private port;
    private db;
    constructor(port: number, databaseUrl: string);
    start: () => Promise<void>;
}
