import { Directions, ProcessFile, ProcessHandler } from "..";
export declare type CoinElement = 'none';
export interface CoinState {
    stage: 'empty' | 'initialized' | 'running';
    coin1: number;
    coin5: number;
    coin10: number;
}
export declare type CoinAction = {
    target: 'coin1' | 'coin5' | 'coin10';
    count: number;
} | 'initialize';
export declare class CoinHandler extends ProcessHandler<CoinElement, CoinState, CoinAction> {
    canHandle(file: ProcessFile): boolean;
    startingState(): CoinState;
    getDirections(state: CoinState): Promise<Directions<CoinElement, CoinAction>>;
}
