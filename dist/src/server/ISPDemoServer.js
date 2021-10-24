"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISPDemoServer = void 0;
const express_1 = __importDefault(require("express"));
const knex_1 = __importDefault(require("knex"));
const cors_1 = __importDefault(require("cors"));
const router_1 = require("./router");
const __1 = require("..");
/**
 * Simple demo server.
 */
class ISPDemoServer {
    constructor(port, databaseUrl, handlers = []) {
        this.app = (0, express_1.default)();
        this.start = async () => {
            await this.db.migrate.rollback(); // If you don't want reset between restarts, remove this.
            await this.db.migrate.latest();
            const configurator = () => {
                const system = new __1.ProcessingSystem(this.db);
                this.handlers.forEach(handler => system.register(handler));
                return system;
            };
            this.app.use((req, res, next) => { console.log(new Date(), req.method, req.url); next(); });
            this.app.use((0, cors_1.default)('*'));
            this.app.use(express_1.default.json({ limit: '1024MB' }));
            this.app.use('/api/isp', (0, router_1.router)(this.db, configurator));
            this.server = this.app.listen(this.port, () => {
                console.log(`Server started on port ${this.port}.`);
            });
            this.server.on('error', (msg) => {
                console.error(msg);
            });
        };
        this.port = port;
        this.db = (0, knex_1.default)(databaseUrl);
        this.handlers = handlers;
    }
}
exports.ISPDemoServer = ISPDemoServer;
