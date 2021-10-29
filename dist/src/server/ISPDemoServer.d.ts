import { ProcessConnector, ProcessHandler } from '..';
/**
 * Simple demo server.
 *
 * Usage:
 * ```
 *  const handler1 = new MyCustomHandler('Custom 1')
 *  const handler2 = new MyCustomHandler('Custom 2')
 *  const server = new ISPDemoServer<DemoElement, DemoState, DemoAction>(PORT, DATABASE_URL, [handler1, handler2])
 *  server.start()
 * ```
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
