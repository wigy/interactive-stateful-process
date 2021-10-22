import { Directions, ProcessFile, ProcessHandler, ProcessStep } from "..";
export declare type CoinElement = 'none' | 'ask';
export interface CoinState {
    stage: 'empty' | 'initialized' | 'running';
    coin1: number;
    coin5: number;
    coin10: number;
}
export declare type CoinAction = {
    target: 'coin1' | 'coin5' | 'coin10';
    count: number;
} | {
    target: 'initialize';
} | {
    target: 'trigger error';
};
export declare class CoinHandler extends ProcessHandler<CoinElement, CoinState, CoinAction> {
    canHandle(file: ProcessFile): boolean;
    startingState(): CoinState;
    getDirections(state: CoinState): Promise<Directions<CoinElement, CoinAction>>;
    action(action: CoinAction, state: CoinState, files: ProcessFile[]): Promise<CoinState>;
    checkCompletion(state: CoinState): boolean | undefined;
    rollback(step: ProcessStep<CoinElement, CoinState, CoinAction>): Promise<boolean>;
}
