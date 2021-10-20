var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProcessingSystem } from '../src/process';
import Knex from 'knex';
import { CoinHandler } from '../src/testing';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test';
test('process handling with coins', () => __awaiter(void 0, void 0, void 0, function* () {
    // Set up test database.
    const db = Knex(DATABASE_URL);
    yield db.migrate.latest();
    const system = new ProcessingSystem(db);
    // Set up the system.
    system.register(new CoinHandler('Coin Pile Adder'));
    const sample = {
        name: 'sample.txt',
        encoding: 'ascii',
        data: '#1,5,10\n2,4,10\n'
    };
    // Start the process.
    const process = yield system.createProcess('Handle 3 stacks of coins', sample);
    // TODO: Hmm.
    // const start = system.startingDirections('web')
    // console.log(start)
    // expect(start.length).toBe(1)
    // Add a coin.
    /*
    const action = new Action<CoinActionData>({
      "process": "coins",
      "action": "init",
      "data": {
        "target": "coin1",
        "count": +1
      }
    })
    */
    // await system.handleAction(process.id, action)
    console.log('PROCESSES', yield db('processes').select('*'));
    console.log('FILES', yield db('process_files').select('*'));
    console.log('STEPS', yield db('process_steps').select('*'));
    yield db.migrate.rollback();
}));
