import { ProcessingSystem, ProcessHandler, ProcessType } from '../src/process'
import { Directions } from '../src/directions'
import { Action } from '../src'
import Knex from 'knex'

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'

// We don't use elements.
type ElementType = 'none'

// Counters for 3 types of coins.
interface State {
  coin1: number
  coin5: number
  coin10: number
}

// Actions for changing amounts of one of the cointypes.
interface ActionData {
  target: 'coin1' | 'coin5' | 'coin10'
  count: number
}

// Handler for the process.
class CoinHandler extends ProcessHandler<ElementType, State, ActionData> {

  startingDirections(type: ProcessType): Directions<ElementType, ActionData> | null {
    if (type === 'web') {
      return new Directions<ElementType, ActionData>({
        title: 'Coin Add or Del',
        type: 'web',
        process: this.name,
        step: 0,
        description: 'Toss coins around.',
        content: {
          elements: [],
          actions: []
        }
      })
    }

    return null
  }

  startingState(type: ProcessType): State {
    if (type === 'web') {
      return {
        coin1: 0,
        coin5: 0,
        coin10: 0,
      }
    }
    throw new Error('Not supported type.')
  }
}

test('process handling with coins', async () => {

  // Set up test database.
  const db = Knex(DATABASE_URL)
  await db.migrate.latest()
  const system = new ProcessingSystem<ElementType, State, ActionData>(db)

  // Set up the system.
  system.register(new CoinHandler('coins'))

  // Start the process.
  const process = await system.createProcess('web', 'coins', {
    type: "web",
    referrer: 'http://localhost'
  })

  // TODO: Hmm.
  // const start = system.startingDirections('web')
  // console.log(start)
  // expect(start.length).toBe(1)

  // Add a coin.
  const action = new Action<ActionData>({
    "process": "coins",
    "action": "init",
    "data": {
      "target": "coin1",
      "count": +1
    }
  })
  await system.handleAction(process.id, action)

  await db.migrate.rollback()
})
