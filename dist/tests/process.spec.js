var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProcessingSystem, ProcessHandler } from '../src/process';
import { Directions } from '../src/directions';
import Knex from 'knex';
import fs from 'fs';
const system = new ProcessingSystem();
class CoinHandler extends ProcessHandler {
    startingPoint(type) {
        if (type === 'web') {
            return new Directions({
                title: 'Coin Add or Del',
                type: 'web',
                process: this.name,
                step: 0,
                description: 'Toss coins around.',
                content: {
                    elements: [],
                    actions: []
                }
            });
        }
        return null;
    }
}
test('process handling', () => __awaiter(void 0, void 0, void 0, function* () {
    // Set up test database.
    const dbPath = `${__dirname}/../process-test.sqlite`;
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
    const db = Knex('postgres://user:pass@localhost/test');
    yield db.migrate.latest();
    system.useKnex(db);
    // Set up the system.
    system.register(new CoinHandler('coins'));
    // Start the process.
    const start = system.startingPoints('web');
    expect(start.length).toBe(1);
    const id = yield system.createProcess('web', {
        "process": "coins",
        "action": "init",
        "data": {
            "target": "coin1",
            "count": 0
        }
    }, {
        type: "web",
        referrer: 'http://localhost'
    });
    console.log('ID', id);
}));
