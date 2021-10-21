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

  const sample: ProcessFileData = {
    name: 'sample.txt',
    encoding: 'ascii',
    data: '#1,5,10\n2,4,10\n'
  }

  // Launch the process.
  const process = await system.createProcess('Handle 3 stacks of coins', sample)
  expect(process.status()).toBe(ProcessStatus.INCOMPLETE)
  expect(process.state()).toStrictEqual({
    stage: 'empty',
    coin1: 0,
    coin5: 0,
    coin10: 0,
  })

  // Let it run a bit.
  await process.run()
  expect(process.status()).toBe(ProcessStatus.WAITING)
  expect(process.state()).toStrictEqual({
    stage: 'initialized',
    coin1: 2,
    coin5: 4,
    coin10: 10,
  })

  // Give some manual input.
  let action: CoinAction = { target: 'coin1', count: +4 }
  await process.input(action)
  action = { target: 'coin5', count: +0 }
  await process.input(action)
  action = { target: 'coin10', count: -8 }
  await process.input(action)
  expect(process.state()).toStrictEqual({
    stage: 'running',
    coin1: 6,
    coin5: 4,
    coin10: 2,
  })

  // Reload the process from the disk.
  const copy = await system.loadProcess(process.id)
  console.log(await copy.getCurrentStep())
  // TODO: Add failure check (coin < 0) and success check (coin > 10) and run process until finished.
  // TODO: Add check for making exception during the processing.
  // TODO: Rolling back steps.

  // console.log('PROCESSES', await db('processes').select('*'))
  // console.log('FILES', await db('process_files').select('*'))
  // console.log('STEPS', await db('process_steps').select('*'))
  await db.migrate.rollback()
})
