"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinHandler = void 0;
const __1 = require("..");
// Handler for the process.
class CoinHandler extends __1.ProcessHandler {
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
    async getDirections(state) {
        switch (state.stage) {
            case 'empty':
                return new __1.Directions({
                    type: 'action',
                    action: { target: 'initialize' }
                });
            case 'running':
            case 'initialized':
                return new __1.Directions({
                    type: 'ui',
                    element: 'ask'
                });
            default:
                throw new __1.BadState(`Cannot find directions from ${JSON.stringify(state)}`);
        }
    }
    async action(process, action, state, files) {
        if (action.target === 'initialize') {
            files.forEach(f => {
                const [c1, c5, c10] = f.data.split('\n')[1].split(',').map(n => parseInt(n));
                state.coin1 += c1;
                state.coin5 += c5;
                state.coin10 += c10;
            });
            state.stage = 'initialized';
        }
        else if (action.target === 'coin1') {
            state.coin1 += action.count;
            state.stage = 'running';
        }
        else if (action.target === 'coin5') {
            state.coin5 += action.count;
            state.stage = 'running';
        }
        else if (action.target === 'coin10') {
            state.coin10 += action.count;
            state.stage = 'running';
        }
        else if (action.target === 'trigger error') {
            throw new Error('This error was intentionally triggered.');
        }
        return state;
    }
    checkCompletion(state) {
        if (state.stage === 'running') {
            // If any pile is negative, process fails.
            if (state.coin1 < 0 || state.coin5 < 0 || state.coin10 < 0) {
                return false;
            }
            // If any pile is over 10, process succeeds.
            if (state.coin1 > 10 || state.coin5 > 10 || state.coin10 > 10) {
                return true;
            }
        }
    }
    async rollback(step) {
        // Have an arbitrary condition to allow imaginary rollback: not allowed if any pile is empty.
        const { coin1, coin5, coin10 } = step.state;
        return coin1 !== 0 && coin5 !== 0 && coin10 !== 0;
    }
}
exports.CoinHandler = CoinHandler;
