"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessHandler = void 0;
const __1 = require("..");
/**
 * A handler taking care of moving between process states.
 */
class ProcessHandler {
    constructor(name) {
        this.name = name;
    }
    /**
     * Attach this handler to the processing system during the registration.
     * @param system
     */
    connect(system) {
        this.system = system;
    }
    /**
     * Check if we are able to handle the given data.
     * @param file
     */
    canHandle(file) {
        throw new __1.NotImplemented(`A handler '${this.name}' cannot check file '${file.name}', since canHandle() is not implemented.`);
    }
    /**
     * Check if the state is either successful `true` or failed `false` or not yet complete `undefined`.
     * @param state
     */
    checkCompletion(state) {
        throw new __1.NotImplemented(`A handler '${this.name}' cannot check state '${JSON.stringify(state)}', since checkCompletion() is not implemented.`);
    }
    /**
     * Execute an action to the state in order to produce new state. Note that state is cloned and can be modified to be new state.
     * @param action
     * @param state
     * @param files
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async action(process, action, state, files) {
        throw new __1.NotImplemented(`A handler '${this.name}' for files ${files.map(f => `'${f}''`).join(', ')} does not implement action()`);
    }
    /**
     * Construct intial state from the given data.
     * @param file
     */
    startingState(file) {
        throw new __1.NotImplemented(`A handler '${this.name}' for file '${file.name}' does not implement startingState()`);
    }
    /**
     * Figure out possible directions from the given state.
     * @param state
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getDirections(state, config) {
        throw new __1.NotImplemented(`A handler '${this.name}' for state '${JSON.stringify(state)}' does not implement getDirections()`);
    }
    /**
     * See if it is possible rollback a step.
     * @param step
     */
    async rollback(step) {
        throw new __1.NotImplemented(`A handler '${this.name}' for step '${step}' does not implement rollback()`);
    }
}
exports.ProcessHandler = ProcessHandler;
