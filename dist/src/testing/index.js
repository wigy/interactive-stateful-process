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
                        action: 'initialize'
                    });
                default:
                    throw new BadState(`Cannot find directions from ${JSON.stringify(state)}`);
            }
        });
    }
}
