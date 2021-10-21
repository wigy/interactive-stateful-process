import { ProcessingSystem } from '../src/process'
import { ProcessFileData } from '../src'
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

  // Start the process.
  const process = await system.createProcess('Handle 3 stacks of coins', sample)
  await process.run()

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
  console.log('PROCESSES', await db('processes').select('*'))
  // console.log('FILES', await db('process_files').select('*'))
  // console.log('STEPS', await db('process_steps').select('*'))
  await db.migrate.rollback()
})
