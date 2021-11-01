"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./api"));
function router(db, configurator) {
    const router = express_1.default.Router();
    const api = (0, api_1.default)(db);
    router.get('/', async (req, res) => {
        return res.send(await api.process.get());
    });
    router.post('/', async (req, res) => {
        const system = configurator(req);
        const { files, config } = req.body;
        // TODO: Multifile support. One process per file? Or offer all to system which creates one or more processes.
        // Additional files could be offered to the existing processes created first before creating additional process.
        const process = await system.createProcess(`Uploading ${files[0].type} file ${files[0].name}`, files[0], config);
        if (process.canRun()) {
            await process.run();
        }
        return res.send(await api.process.get(process.id));
    });
    return router;
}
exports.router = router;
