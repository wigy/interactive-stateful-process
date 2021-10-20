import { Directions, ProcessHandler } from "..";
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
    startingDirections(type) {
        if (type === 'web') {
            return new Directions({
                title: 'Coin Add or Del',
                type: 'web',
                process: this.name,
                step: 0,
                description: 'Toss coins around.',
                content: {
                    elements: [],
                    actions: []
                }
            });
        }
        return null;
    }
}
