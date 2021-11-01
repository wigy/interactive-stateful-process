import { ProcessConnector, ProcessHandler } from '..';
/**
 * Simple demo server for one or more handler.
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
    /**
     * Prepare settings.
     *
     * @param port
     * @param databaseUrl
     * @param handlers
     * @param connector
     */
    constructor(port: number, databaseUrl: string, handlers: ProcessHandler<DemoElement, DemoState, DemoAction>[], connector?: ProcessConnector | null);
    /**
     * Launch the demo server.
     */
    start: () => Promise<void>;
    /**
     * Exit the server. If an error is given, raise also that error.
     * @param err
     */
    stop: (err?: Error | undefined) => Promise<void>;
}
