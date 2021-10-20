import { ProcessFile, ProcessHandler } from ".."

// We don't use elements in this dummy process.
export type CoinElementType = 'none'

// Counters for 3 types of coins.
export interface CoinState {
  stage: 'empty' | 'initialized' | 'running'
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
}
