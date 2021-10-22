var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProcessingSystem, ProcessStatus } from '../src';
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
    system.logger.info = () => undefined;
    const sample = {
        name: 'sample.txt',
        encoding: 'ascii',
        data: '#1,5,10\n2,4,10\n'
    };
    // Launch the process.
    const process = yield system.createProcess('Handle 3 stacks of coins', sample);
    expect(process.status).toBe(ProcessStatus.INCOMPLETE);
    expect(process.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    // Let it run a bit.
    yield process.run();
    expect(process.status).toBe(ProcessStatus.WAITING);
    expect(process.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    // Give some manual input.
    yield process.input({ target: 'coin1', count: +4 });
    yield process.input({ target: 'coin5', count: +0 });
    yield process.input({ target: 'coin10', count: -8 });
    expect(process.status).toBe(ProcessStatus.WAITING);
    expect(process.state).toStrictEqual({
        stage: 'running',
        coin1: 6,
        coin5: 4,
        coin10: 2,
    });
    // Reload the process from the disk.
    const copy = yield system.loadProcess(process.id);
    expect(copy.status).toBe(ProcessStatus.WAITING);
    expect(copy.state).toStrictEqual({
        stage: 'running',
        coin1: 6,
        coin5: 4,
        coin10: 2,
    });
    // Pump it to the finish.
    yield copy.input({ target: 'coin1', count: +5 });
    expect(copy.status).toBe(ProcessStatus.SUCCEEDED);
    expect(copy.state).toStrictEqual({
        stage: 'running',
        coin1: 11,
        coin5: 4,
        coin10: 2,
    });
    // Create another process.
    const failing = yield system.createProcess('Intentional crash with coins', sample);
    expect(failing.status).toBe(ProcessStatus.INCOMPLETE);
    expect(failing.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    yield failing.run();
    expect(failing.status).toBe(ProcessStatus.WAITING);
    expect(failing.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    // Make it crash.
    system.logger.error = () => undefined;
    yield failing.input({ target: 'trigger error' });
    expect(failing.status).toBe(ProcessStatus.CRASHED);
    expect(failing.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    // And create yet one more process.
    const process2 = yield system.createProcess('Rolling back with coins', sample);
    expect(process2.status).toBe(ProcessStatus.INCOMPLETE);
    expect(process2.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    yield process2.run();
    expect(process2.status).toBe(ProcessStatus.WAITING);
    expect(process2.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    yield process2.input({ target: 'coin5', count: +6 });
    expect(process2.status).toBe(ProcessStatus.WAITING);
    expect(process2.state).toStrictEqual({
        stage: 'running',
        coin1: 2,
        coin5: 10,
        coin10: 10,
    });
    // Now roll back steps.
    yield process2.rollback();
    expect(process2.status).toBe(ProcessStatus.WAITING);
    expect(process2.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    yield process2.rollback();
    expect(process2.status).toBe(ProcessStatus.INCOMPLETE);
    expect(process2.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    // console.log('PROCESSES', await db('processes').select('*'))
    // console.log('FILES', await db('process_files').select('*'))
    // console.log('STEPS', await db('process_steps').select('*'))
    yield db.migrate.rollback();
}));
