import { BadState, Directions, Process, ProcessFile, ProcessHandler, ProcessStep } from ".."

// We don't use elements in this dummy process.
export type CoinElement = 'none' | 'ask'

// Counters for 3 types of coins.
export interface CoinState {
  stage: 'empty' | 'initialized' | 'running'
  coin1: number
  coin5: number
  coin10: number
}

// Actions for changing amounts of one of the cointypes.
export type CoinAction = {
  target: 'coin1' | 'coin5' | 'coin10'
  count: number
} | { target: 'initialize' } | { target: 'trigger error' }

// Handler for the process.
export class CoinHandler extends ProcessHandler<CoinElement, CoinState, CoinAction> {

  canHandle(file: ProcessFile): boolean {
    return /^#1,5,10/.test(file.data)
  }

  startingState(): CoinState {
    return {
      stage: 'empty',
      coin1: 0,
      coin5: 0,
      coin10: 0,
    }
  }

  async getDirections(state: CoinState): Promise<Directions<CoinElement, CoinAction>> {
    switch (state.stage) {
      case 'empty':
        return new Directions<CoinElement, CoinAction>({
          type: 'action',
          action: { target: 'initialize' }
        })
      case 'running':
      case 'initialized':
          return new Directions<CoinElement, CoinAction>({
          type: 'ui',
          element: 'ask'
        })
      default:
        throw new BadState(`Cannot find directions from ${JSON.stringify(state)}`)
    }
  }

  async action(process: Process<CoinElement, CoinState, CoinAction>, action: CoinAction, state: CoinState, files: ProcessFile[]): Promise<CoinState> {
    if (action.target === 'initialize') {
      files.forEach(f => {
        const [c1, c5, c10] = f.data.split('\n')[1].split(',').map(n => parseInt(n))
        state.coin1 += c1
        state.coin5 += c5
        state.coin10 += c10
      })
      state.stage = 'initialized'
    }
    else if (action.target === 'coin1') {
      state.coin1 += action.count
      state.stage = 'running'
    }
    else if (action.target === 'coin5') {
      state.coin5 += action.count
      state.stage = 'running'
    }
    else if (action.target === 'coin10') {
      state.coin10 += action.count
      state.stage = 'running'
    }
    else if (action.target === 'trigger error') {
      throw new Error('This error was intentionally triggered.')
    }
    return state
  }

  checkCompletion(state: CoinState): boolean | undefined {
    if (state.stage === 'running') {
      // If any pile is negative, process fails.
      if (state.coin1 < 0 || state.coin5 < 0 || state.coin10 < 0) {
        return false
      }
      // If any pile is over 10, process succeeds.
      if (state.coin1 > 10 || state.coin5 > 10 || state.coin10 > 10) {
        return true
      }
    }
  }

  async rollback(step: ProcessStep<CoinElement, CoinState, CoinAction>): Promise<boolean> {
    // Have an arbitrary condition to allow imaginary rollback: not allowed if any pile is empty.
    const { coin1, coin5, coin10 } = step.state
    return coin1 !== 0 && coin5 !== 0 && coin10 !== 0
  }
}