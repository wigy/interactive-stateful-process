import { ProcessHandler } from "..";
// Handler for the process.
export class CoinHandler extends ProcessHandler {
    canHandle(file) {
        return /^#1,5,10/.test(file.data);
    }
    startingState() {
        return {
            stage: 'empty',
            coin1: 0,
            coin5: 0,
            coin10: 0,
        };
    }
}
