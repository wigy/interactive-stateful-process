"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ISPDemoServer_1 = require("../src/server/ISPDemoServer");
/**
 * Launch the demo server.
 */
(async () => {
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3302;
    const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test';
    const server = new ISPDemoServer_1.ISPDemoServer(PORT, DATABASE_URL, []);
    server.start();
})();
//# sourceMappingURL=server.js.map