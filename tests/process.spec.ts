import { ProcessingSystem, ProcessHandler, ProcessType } from '../src/process'
import { Directions } from '../src/directions'
import { Action } from '../src'
import Knex from 'knex'

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'

// Action

type ElementType = 'none'

interface State {
  coin1: number
  coin5: number
  coin10: number
}

interface ActionData {
  target: 'coin1' | 'coin5' | 'coin10'
  count: number
}

const system = new ProcessingSystem<ElementType, State, ActionData>()

class CoinHandler extends ProcessHandler<ElementType, State, ActionData> {

  startingDirections(type: ProcessType): Directions<ElementType, ActionData> | null {
    // Hmm. Removing this comment causes jest to crash.
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
    return {
      coin1: 0,
      coin5: 0,
      coin10: 0,
    }
  }
}

test('process handling', async () => {

  // Set up test database.
  const db = Knex(DATABASE_URL)
  await db.migrate.latest()
  system.useKnex(db)

  // Set up the system.
  system.register(new CoinHandler('coins'))

  // Start the process.
  const start = system.startingDirections('web')
  expect(start.length).toBe(1)

  const process = await system.createProcess('web', 'coins', {
      type: "web",
      referrer: 'http://localhost'
  })

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
