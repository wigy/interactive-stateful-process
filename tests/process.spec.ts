import { ProcessingSystem, ProcessHandler, ProcessType } from '../src/process';
import { Step } from '../src/step';

type ElementType = 'none'

interface State {
  count1: number
  count5: number
  count10: number
}

interface ActionData {
}

interface DataType {
}

const system = new ProcessingSystem<ElementType, DataType, State, ActionData>()

class CoinHandler extends ProcessHandler<ElementType, State, ActionData> {
  startingPoints(type: ProcessType): Step<ElementType, ActionData>[] {
    if (type === 'web') {
      return [
        {
          title: 'Coin Add or Del',
          type: 'web',
          process: 'coins', // TODO: Hmm this is bad idea here. Add name for process handler itself?
          step: 0,
          description: 'Toss coins around.',
          content: {
            elements: [],
            actions: []
          }
        }
      ]
    }
    return []
}

}

test('process handling', () => {
    system.register('coins', new CoinHandler())
    console.log(system.startingPoints('web'));
    expect(0).toBe(0);
  });
