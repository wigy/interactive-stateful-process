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
        return res.send(await api.process.getAll());
    });
    router.get('/:id', async (req, res) => {
        return res.send(await api.process.get(parseInt(req.params.id)));
    });
    router.post('/', async (req, res) => {
        const system = configurator(req);
        const { files, config } = req.body;
        const names = files.map(f => f.name);
        const process = await system.createProcess(`Uploading files ${names.join(', ')}`, files, { ...res.locals.server.configDefaults, ...config });
        if (process.canRun()) {
            await process.run();
        }
        return res.send(await api.process.get(process.id));
    });
    router.post('/:id', async (req, res) => {
        const system = configurator(req);
        const { id } = req.params;
        const process = await system.loadProcess(parseInt(id));
        await process.input(req.body);
        if (process.canRun()) {
            await process.run();
        }
        res.sendStatus(204);
    });
    router.get('/:id/step/:number', async (req, res) => {
        return res.send(await api.process.getStep(parseInt(req.params.id), parseInt(req.params.number)));
    });
    return router;
}
exports.router = router;
//# sourceMappingURL=router.js.map