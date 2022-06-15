"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const interactive_elements_1 = require("interactive-elements");
const knex_1 = __importDefault(require("knex"));
const testing_1 = require("../src/testing");
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test';
test('process handling with coins', async () => {
    // Set up test database.
    const db = (0, knex_1.default)(DATABASE_URL);
    await db.migrate.latest();
    src_1.defaultConnector.success = async () => undefined;
    src_1.defaultConnector.fail = async () => undefined;
    const system = new src_1.ProcessingSystem(db, src_1.defaultConnector);
    // Set up the system.
    system.register(new testing_1.CoinHandler('Coin Pile Adder'));
    system.logger.info = () => undefined;
    system.logger.error = () => undefined;
    // Launch the process.
    const sample = {
        name: 'sample.txt',
        encoding: 'utf-8',
        data: '#1,5,10\n2,4,10\n'
    };
    const process = await system.createProcess('Handle 3 stacks of coins', [sample], {});
    expect(process.status).toBe(interactive_elements_1.ProcessStatus.INCOMPLETE);
    expect(process.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    // Let it run a bit.
    await process.run();
    expect(process.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(process.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    // Give some manual input.
    await process.input({ target: 'coin1', count: +4 });
    await process.input({ target: 'coin5', count: +0 });
    await process.input({ target: 'coin10', count: -8 });
    expect(process.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(process.state).toStrictEqual({
        stage: 'running',
        coin1: 6,
        coin5: 4,
        coin10: 2,
    });
    // Reload the process from the disk.
    const copy = await system.loadProcess(process.id);
    expect(copy.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(copy.state).toStrictEqual({
        stage: 'running',
        coin1: 6,
        coin5: 4,
        coin10: 2,
    });
    // Pump it to the finish.
    await copy.input({ target: 'coin1', count: +5 });
    expect(copy.status).toBe(interactive_elements_1.ProcessStatus.SUCCEEDED);
    expect(copy.state).toStrictEqual({
        stage: 'running',
        coin1: 11,
        coin5: 4,
        coin10: 2,
    });
    // Create another process.
    const failing = await system.createProcess('Intentional crash with coins', [sample], {});
    expect(failing.status).toBe(interactive_elements_1.ProcessStatus.INCOMPLETE);
    expect(failing.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    await failing.run();
    expect(failing.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(failing.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    // Make it crash.
    await failing.input({ target: 'trigger error' });
    expect(failing.status).toBe(interactive_elements_1.ProcessStatus.CRASHED);
    expect(failing.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    // And create yet one more process.
    const process2 = await system.createProcess('Rolling back with coins', [sample], {});
    expect(process2.status).toBe(interactive_elements_1.ProcessStatus.INCOMPLETE);
    expect(process2.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    await process2.run();
    expect(process2.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(process2.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    await process2.input({ target: 'coin5', count: +6 });
    expect(process2.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(process2.state).toStrictEqual({
        stage: 'running',
        coin1: 2,
        coin5: 10,
        coin10: 10,
    });
    // Now roll back steps.
    await process2.rollback();
    expect(process2.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(process2.state).toStrictEqual({
        stage: 'initialized',
        coin1: 2,
        coin5: 4,
        coin10: 10,
    });
    await process2.rollback();
    expect(process2.status).toBe(interactive_elements_1.ProcessStatus.INCOMPLETE);
    expect(process2.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    // Try totally wrong file.
    const badSample = {
        name: 'bad.txt',
        encoding: 'utf-8',
        data: 'rubbish\n'
    };
    const failingProcess = await system.createProcess('Try bad file', [badSample], {});
    expect(failingProcess.status).toBe(interactive_elements_1.ProcessStatus.CRASHED);
    expect(failingProcess.error).toBeTruthy();
    // Multiple files.
    const process3 = await system.createProcess('Multiple files', [sample, sample], {});
    expect(process3.status).toBe(interactive_elements_1.ProcessStatus.INCOMPLETE);
    expect(process3.state).toStrictEqual({
        stage: 'empty',
        coin1: 0,
        coin5: 0,
        coin10: 0,
    });
    await process3.run();
    expect(process3.status).toBe(interactive_elements_1.ProcessStatus.WAITING);
    expect(process3.state).toStrictEqual({
        stage: 'initialized',
        coin1: 4,
        coin5: 8,
        coin10: 20,
    });
    // console.log('PROCESSES', await db('processes').select('*'))
    // console.log('FILES', await db('process_files').select('*'))
    // console.log('STEPS', await db('process_steps').select('*'))
    await db.migrate.rollback();
});
//# sourceMappingURL=process.spec.js.map