var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BadState, Directions, ProcessHandler } from "..";
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
    getDirections(state) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (state.stage) {
                case 'empty':
                    return new Directions({
                        type: 'action',
                        action: { target: 'initialize' }
                    });
                case 'running':
                case 'initialized':
                    return new Directions({
                        type: 'ui',
                        element: 'ask'
                    });
                default:
                    throw new BadState(`Cannot find directions from ${JSON.stringify(state)}`);
            }
        });
    }
    action(action, state, files) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
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
    rollback(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Have an arbitrary condition to allow imaginary rollback: not allowed if any pile is empty.
            const { coin1, coin5, coin10 } = step.state;
            return coin1 !== 0 && coin5 !== 0 && coin10 !== 0;
        });
    }
}
