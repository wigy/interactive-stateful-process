import { ProcessingSystem, ProcessFile } from '../src/process'
import { Action } from '../src'
import Knex from 'knex'
import { CoinActionData, CoinElementType, CoinHandler, CoinState } from '../src/testing'

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'


test('process handling with coins', async () => {

  // Set up test database.
  const db = Knex(DATABASE_URL)
  await db.migrate.latest()
  const system = new ProcessingSystem<CoinElementType, CoinState, CoinActionData>(db)

  // Set up the system.
  system.register(new CoinHandler('coins'))

  const sample: ProcessFile = {
    name: 'sample.txt',
    encoding: 'ascii',
    data: '#1,5,10\n2,4,10\n'
  }

  // Start the process.
  const process = await system.createProcess('web', 'Handle 3 stacks of coins', sample)
  console.log(process)
  // TODO: Hmm.
  // const start = system.startingDirections('web')
  // console.log(start)
  // expect(start.length).toBe(1)

  // Add a coin.
  const action = new Action<CoinActionData>({
    "process": "coins",
    "action": "init",
    "data": {
      "target": "coin1",
      "count": +1
    }
  })
  // await system.handleAction(process.id, action)

  await db.migrate.rollback()
})
