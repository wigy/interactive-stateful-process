"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISPDemoServer = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const knex_1 = __importDefault(require("knex"));
const cors_1 = __importDefault(require("cors"));
const router_1 = require("./router");
const __1 = require("..");
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
class ISPDemoServer {
    /**
     * Prepare settings.
     *
     * @param port
     * @param databaseUrl
     * @param handlers
     * @param connector
     */
    constructor(port, databaseUrl, handlers, connector = null, configDefaults = {}) {
        this.app = (0, express_1.default)();
        /**
         * Launch the demo server.
         *
         * @param reset If set, reset the database on boot.
         */
        this.start = async (reset = false) => {
            if (reset) {
                await this.db.migrate.rollback();
            }
            await this.db.migrate.latest();
            const systemCreator = () => {
                const system = new __1.ProcessingSystem(this.db, this.connector);
                this.handlers.forEach(handler => system.register(handler));
                return system;
            };
            this.app.use((req, res, next) => { res.locals.server = this; next(); });
            this.app.use((req, res, next) => { console.log(new Date(), req.method, req.url); next(); });
            this.app.use((0, cors_1.default)('*'));
            this.app.use(express_1.default.json({ limit: '1024MB' }));
            this.app.use('/api/isp', (0, router_1.router)(this.db, systemCreator));
            this.server = this.app.listen(this.port, () => {
                console.log(new Date(), `Server started on port ${this.port}.`);
                this.connector.initialize(this);
            });
            this.server.on('error', (msg) => {
                console.error(new Date(), msg);
            });
        };
        /**
         * Exit the server. If an error is given, raise also that error.
         * @param err
         */
        this.stop = async (err = undefined) => {
            console.log(new Date(), 'Stopping the server.');
            await this.server.close(() => {
                if (err) {
                    throw err;
                }
                else {
                    process.exit();
                }
            });
        };
        this.port = port;
        this.configDefaults = configDefaults;
        let migrationsPath = path_1.default.normalize(`${__dirname}/../../dist/migrations/01_init.js`);
        if (!fs_1.default.existsSync(migrationsPath)) {
            migrationsPath = path_1.default.normalize(`${__dirname}/../../../dist/migrations/01_init.js`);
        }
        if (!fs_1.default.existsSync(migrationsPath)) {
            throw new Error('Cannot find migrations file 01_init.js.');
        }
        this.db = (0, knex_1.default)({
            client: 'pg',
            connection: databaseUrl,
            migrations: {
                directory: path_1.default.dirname(migrationsPath)
            }
        });
        this.handlers = handlers;
        if (connector) {
            this.connector = connector;
        }
        else {
            this.connector = __1.defaultConnector;
        }
    }
}
exports.ISPDemoServer = ISPDemoServer;
