import { ProcessingSystem, ProcessHandler, ProcessType } from '../src/process';
import { Directions } from '../src/directions';
import { Action } from '../src';
import Knex from 'knex'
import fs from 'fs'

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

  startingState(type: ProcessType): State | null {
    if (type === 'web') {
      return {
        coin1: 0,
        coin5: 0,
        coin10: 0,
      }
    }
    return null
  }
}

test('process handling', async () => {

  // Set up test database.
  const dbPath = `${__dirname}/../process-test.sqlite`
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }

  const db = Knex('postgres://user:pass@localhost/test');
  await db.migrate.latest()
  system.useKnex(db);

  // Set up the system.
  system.register(new CoinHandler('coins'))

  // Start the process.
  const start = system.startingDirections('web');
  expect(start.length).toBe(1);

  const action = new Action<ActionData>({
    "process": "coins",
    "action": "init",
    "data": {
        "target": "coin1",
        "count": 0
    }
  })
  const id = await system.createProcess('web', action, {
      type: "web",
      referrer: 'http://localhost'
  })
  console.log('ID', id);


});
