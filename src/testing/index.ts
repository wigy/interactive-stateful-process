import { Directions, ProcessHandler, ProcessType } from ".."

// We don't use elements in this dummy process.
export type CoinElementType = 'none'

// Counters for 3 types of coins.
export interface CoinState {
  coin1: number
  coin5: number
  coin10: number
}

// Actions for changing amounts of one of the cointypes.
export interface CoinActionData {
  target: 'coin1' | 'coin5' | 'coin10'
  count: number
}

// Handler for the process.
export class CoinHandler extends ProcessHandler<CoinElementType, CoinState, CoinActionData> {

  startingDirections(type: ProcessType): Directions<CoinElementType, CoinActionData> | null {
    if (type === 'web') {
      return new Directions<CoinElementType, CoinActionData>({
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

  startingState(type: ProcessType): CoinState {
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
