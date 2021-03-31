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
import Knex from 'knex';
import fs from 'fs';
const system = new ProcessingSystem();
class CoinHandler extends ProcessHandler {
    startingPoint(type) {
        if (type === 'web') {
            return {
                title: 'Coin Add or Del',
                type: 'web',
                process: this.name,
                step: 0,
                description: 'Toss coins around.',
                content: {
                    elements: [],
                    actions: []
                }
            };
        }
        return null;
    }
}
test('process handling', () => __awaiter(void 0, void 0, void 0, function* () {
    system.register(new CoinHandler('coins'));
    const start = system.startingPoints('web');
    expect(start.length).toBe(1);
    const id = system.createProcess('web', {
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
    const dbPath = `${__dirname}/../process-test.sqlite`;
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
    const db = Knex({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: dbPath
        }
    });
    yield db.migrate.latest();
    system.useKnex(db);
    // await db('processes').insert({ id: 2, name: 'Foo', origin: {a: 12} })
}));
