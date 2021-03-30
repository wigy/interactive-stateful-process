import { ProcessingSystem, ProcessHandler, ProcessType } from '../src/process';
import { Directions } from '../src/directions';

type ElementType = 'none'

interface State {
  coin1: number
  coin5: number
  coin10: number
}

interface ActionData {
}

interface DataType {
}

const system = new ProcessingSystem<ElementType, DataType, State, ActionData>()

class CoinHandler extends ProcessHandler<ElementType, State, ActionData> {

  startingPoint(type: ProcessType): Directions<ElementType, ActionData> {
    if (type === 'web') {
      return {
        title: 'Coin Add or Del',
        type: 'web',
        process: this.name,
        step: 0,
        description: 'Toss coins around.',
        content: {
          elements: [],
          actions: []
        }
      }
    }

    return null
  }
}

test('process handling', () => {
  system.register(new CoinHandler('coins'))
  const start = system.startingPoints('web');
  expect(start.length).toBe(1);

  const fromUi = {
    "process": "coins",
    "action": "add",
    "data": {
        "target": "coin1",
        "count": 2
    }
  }

  // system.createProcess(fromUi)

});
