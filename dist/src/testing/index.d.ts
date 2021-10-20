import { Directions, ProcessFile, ProcessHandler, ProcessType } from "..";
export declare type CoinElementType = 'none';
export interface CoinState {
    stage: 'empty' | 'initialized' | 'running';
    coin1: number;
    coin5: number;
    coin10: number;
}
export interface CoinActionData {
    target: 'coin1' | 'coin5' | 'coin10';
    count: number;
}
export declare class CoinHandler extends ProcessHandler<CoinElementType, CoinState, CoinActionData> {
    canHandle(file: ProcessFile): boolean;
    startingState(): CoinState;
    startingDirections(type: ProcessType): Directions<CoinElementType, CoinActionData> | null;
}
