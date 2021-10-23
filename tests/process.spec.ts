import { ProcessingSystem, ProcessFileData, ProcessStatus } from '../src'
import Knex from 'knex'
import { CoinAction, CoinElement, CoinHandler, CoinState } from '../src/testing'

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'


test('process handling with coins', async () => {

  // Set up test database.
  const db = Knex(DATABASE_URL)
  await db.migrate.latest()
  const system = new ProcessingSystem<CoinElement, CoinState, CoinAction>(db)

  // Set up the system.
  system.register(new CoinHandler('Coin Pile Adder'))
  system.logger.info = () => undefined

  const sample: ProcessFileData = {
    name: 'sample.txt',
    encoding: 'ascii',
    data: '#1,5,10\n2,4,10\n'
  }

  // Launch the process.
  const process = await system.createProcess('Handle 3 stacks of coins', sample)
  expect(process.status).toBe(ProcessStatus.INCOMPLETE)
  expect(process.state).toStrictEqual({
    stage: 'empty',
    coin1: 0,
    coin5: 0,
    coin10: 0,
  })

  // Let it run a bit.
  await process.run()
  expect(process.status).toBe(ProcessStatus.WAITING)
  expect(process.state).toStrictEqual({
    stage: 'initialized',
    coin1: 2,
    coin5: 4,
    coin10: 10,
  })

  // Give some manual input.
  await process.input({ target: 'coin1', count: +4 })
  await process.input({ target: 'coin5', count: +0 })
  await process.input({ target: 'coin10', count: -8 })
  expect(process.status).toBe(ProcessStatus.WAITING)
  expect(process.state).toStrictEqual({
    stage: 'running',
    coin1: 6,
    coin5: 4,
    coin10: 2,
  })

  // Reload the process from the disk.
  const copy = await system.loadProcess(process.id)
  expect(copy.status).toBe(ProcessStatus.WAITING)
  expect(copy.state).toStrictEqual({
    stage: 'running',
    coin1: 6,
    coin5: 4,
    coin10: 2,
  })

  // Pump it to the finish.
  await copy.input({ target: 'coin1', count: +5 })
  expect(copy.status).toBe(ProcessStatus.SUCCEEDED)
  expect(copy.state).toStrictEqual({
    stage: 'running',
    coin1: 11,
    coin5: 4,
    coin10: 2,
  })

  // Create another process.
  const failing = await system.createProcess('Intentional crash with coins', sample)
  expect(failing.status).toBe(ProcessStatus.INCOMPLETE)
  expect(failing.state).toStrictEqual({
    stage: 'empty',
    coin1: 0,
    coin5: 0,
    coin10: 0,
  })
  await failing.run()
  expect(failing.status).toBe(ProcessStatus.WAITING)
  expect(failing.state).toStrictEqual({
    stage: 'initialized',
    coin1: 2,
    coin5: 4,
    coin10: 10,
  })

  // Make it crash.
  system.logger.error = () => undefined
  await failing.input({ target: 'trigger error' })
  expect(failing.status).toBe(ProcessStatus.CRASHED)
  expect(failing.state).toStrictEqual({
    stage: 'initialized',
    coin1: 2,
    coin5: 4,
    coin10: 10,
  })

  // And create yet one more process.
  const process2 = await system.createProcess('Rolling back with coins', sample)
  expect(process2.status).toBe(ProcessStatus.INCOMPLETE)
  expect(process2.state).toStrictEqual({
    stage: 'empty',
    coin1: 0,
    coin5: 0,
    coin10: 0,
  })
  await process2.run()
  expect(process2.status).toBe(ProcessStatus.WAITING)
  expect(process2.state).toStrictEqual({
    stage: 'initialized',
    coin1: 2,
    coin5: 4,
    coin10: 10,
  })
  await process2.input({ target: 'coin5', count: +6 })
  expect(process2.status).toBe(ProcessStatus.WAITING)
  expect(process2.state).toStrictEqual({
    stage: 'running',
    coin1: 2,
    coin5: 10,
    coin10: 10,
  })

  // Now roll back steps.
  await process2.rollback()
  expect(process2.status).toBe(ProcessStatus.WAITING)
  expect(process2.state).toStrictEqual({
    stage: 'initialized',
    coin1: 2,
    coin5: 4,
    coin10: 10,
  })

  await process2.rollback()
  expect(process2.status).toBe(ProcessStatus.INCOMPLETE)
  expect(process2.state).toStrictEqual({
    stage: 'empty',
    coin1: 0,
    coin5: 0,
    coin10: 0,
  })

  // Try totally wrong file.
  const badSample: ProcessFileData = {
    name: 'bad.txt',
    encoding: 'ascii',
    data: 'rubbish\n'
  }
  const failingProcess = await system.createProcess('Try bad file', badSample)
  expect(failingProcess.status).toBe(ProcessStatus.CRASHED)
  expect(failingProcess.error).toBeTruthy()

  // console.log('PROCESSES', await db('processes').select('*'))
  // console.log('FILES', await db('process_files').select('*'))
  // console.log('STEPS', await db('process_steps').select('*'))
  await db.migrate.rollback()
})
