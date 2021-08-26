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
import { Action } from '../src';
import Knex from 'knex';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test';
const system = new ProcessingSystem();
class CoinHandler extends ProcessHandler {
    startingDirections(type) {
        // Hmm. Removing this comment causes jest to crash.
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
    startingState(type) {
        return {
            coin1: 0,
            coin5: 0,
            coin10: 0,
        };
    }
}
test('process handling', () => __awaiter(void 0, void 0, void 0, function* () {
    // Set up test database.
    const db = Knex(DATABASE_URL);
    yield db.migrate.latest();
    system.useKnex(db);
    // Set up the system.
    system.register(new CoinHandler('coins'));
    // Start the process.
    const start = system.startingDirections('web');
    expect(start.length).toBe(1);
    const process = yield system.createProcess('web', 'coins', {
        type: "web",
        referrer: 'http://localhost'
    });
    // Add a coin.
    const action = new Action({
        "process": "coins",
        "action": "init",
        "data": {
            "target": "coin1",
            "count": +1
        }
    });
    yield system.handleAction(process.id, action);
    yield db.migrate.rollback();
}));
