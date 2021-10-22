var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { InvalidArgument, NotImplemented } from "./error";
import { Directions } from './directions';
import { BadState, DatabaseError } from "./error";
import clone from "clone";
/**
 * Overall status of the process.
 *
 *  * INCOMPLETE - Something has stopped the process before it has been finished properly.
 *  * WAITING - The process is currently waiting for external input.
 *  * SUCCEEDED - The process is completed successfully.
 *  * FAILED - The process is completed unsuccessfully.
 *  * CRASHED - A handler has crashed at some point and process is halted.
 *
 */
export var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus["INCOMPLETE"] = "INCOMPLETE";
    ProcessStatus["WAITING"] = "WAITING";
    ProcessStatus["SUCCEEDED"] = "SUCCEEDED";
    ProcessStatus["FAILED"] = "FAILED";
    ProcessStatus["CRASHED"] = "CRASHED";
})(ProcessStatus || (ProcessStatus = {}));
/**
 * An instance of input data for processing.
 */
export class ProcessFile {
    constructor(obj) {
        this.id = null;
        this.processId = obj.processId || null;
        this.name = obj.name;
        this.encoding = obj.encoding;
        this.data = obj.data;
    }
    toString() {
        return `ProcessFile #${this.id} ${this.name}`;
    }
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON() {
        return {
            processId: this.processId,
            name: this.name,
            encoding: this.encoding,
            data: this.data
        };
    }
    /**
     * Save the file to the database.
     */
    save(db) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = this.toJSON();
            if (this.encoding === 'json') {
                out.data = JSON.stringify(out.data);
            }
            if (this.id) {
                yield db('process_files').update(out).where({ id: this.id });
                return this.id;
            }
            else {
                this.id = (yield db('process_files').insert(out).returning('id'))[0];
                if (this.id)
                    return this.id;
                throw new DatabaseError(`Saving process ${JSON.stringify(out)} failed.`);
            }
        });
    }
}
/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
export class ProcessStep {
    constructor(obj) {
        this.processId = obj.processId || null;
        this.number = obj.number;
        this.state = obj.state;
        this.handler = obj.handler;
        this.directions = obj.directions ? new Directions(obj.directions) : undefined;
        this.action = obj.action;
        this.started = obj.started;
        this.finished = obj.finished;
    }
    toString() {
        return `ProcessStep ${this.number} of Process #${this.processId}`;
    }
    /**
     * Get a reference to the database.
     */
    get db() {
        return this.process.db;
    }
    /**
     * Save the process info to the database.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id) {
                yield this.db('process_steps').update(this.toJSON()).where({ id: this.id });
                return this.id;
            }
            else {
                this.started = new Date();
                this.id = (yield this.db('process_steps').insert(this.toJSON()).returning('id'))[0];
                if (this.id)
                    return this.id;
                throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
            }
        });
    }
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON() {
        return {
            processId: this.processId,
            number: this.number,
            state: this.state,
            directions: this.directions,
            handler: this.handler,
            action: this.action,
            started: this.started,
            finished: this.finished,
        };
    }
    /**
     * Set directions and update database.
     * @param db
     * @param directions
     */
    setDirections(db, directions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.directions = directions;
            yield db('process_steps').update({ directions: directions.toJSON() }).where({ id: this.id });
        });
    }
}
/**
 * A complete description of the process state and steps taken.
 */
export class Process {
    constructor(system, name) {
        this.system = system;
        this.id = null;
        this.name = name || '[no name]';
        this.complete = false;
        this.successful = undefined;
        this.files = [];
        this.steps = [];
        this.currentStep = undefined;
        this.status = ProcessStatus.INCOMPLETE;
    }
    toString() {
        return `Process #${this.id} ${this.name}`;
    }
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON() {
        return {
            name: this.name,
            complete: this.complete,
            successful: this.successful,
            currentStep: this.currentStep,
            status: this.status,
        };
    }
    /**
     * Append a file to this process and link its ID.
     * @param file
     */
    addFile(file) {
        file.processId = this.id;
        this.files.push(file);
    }
    /**
     * Append a step to this process and link its ID.
     * @param step
     */
    addStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            step.processId = this.id;
            step.process = this;
            this.steps.push(step);
        });
    }
    /**
     * Load the current step if necessary and return it.
     */
    getCurrentStep() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentStep === null || this.currentStep === undefined) {
                throw new BadState(`Process #${this.id} ${this.name} has invalid current step.`);
            }
            if (this.steps[this.currentStep]) {
                return this.steps[this.currentStep];
            }
            return this.loadStep(this.currentStep);
        });
    }
    /**
     * Mark the current state as completed and create new additional step with the new state.
     * @param state
     */
    proceedToState(action, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.getCurrentStep();
            const handler = this.system.getHandler(current.handler);
            current.action = action;
            current.finished = new Date();
            current.save();
            const nextStep = new ProcessStep({
                number: current.number + 1,
                state,
                handler: handler.name
            });
            this.addStep(nextStep);
            this.currentStep = (this.currentStep || 0) + 1;
            this.save();
            yield nextStep.save();
            yield this.system.checkFinishAndFindDirections(handler, nextStep);
        });
    }
    /**
     * Get a reference to the database.
     */
    get db() {
        return this.system.db;
    }
    /**
     * Save the process info to the database.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id) {
                yield this.db('processes').update(this.toJSON()).where({ id: this.id });
                return this.id;
            }
            else {
                this.id = (yield this.db('processes').insert(this.toJSON()).returning('id'))[0];
                if (this.id)
                    return this.id;
                throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
            }
        });
    }
    /**
     * Load the process data and its files. Note that current step is not yet loaded here, but when using getCurrentStep().
     * @param id
     */
    load(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load basic info.
            const data = yield this.db('processes').select('*').where({ id }).first();
            if (!data) {
                throw new InvalidArgument(`Cannot find process #${id}`);
            }
            Object.assign(this, data);
            this.id = id;
            // Load files.
            this.files = (yield this.db('process_files').select('*').where({ processId: this.id })).map(fileData => {
                const file = new ProcessFile(fileData);
                file.id = fileData.id;
                return file;
            });
            // Load current step.
            yield this.getCurrentStep();
        });
    }
    /**
     * Load the step with the given number from the database.
     * @param number
     * @returns
     */
    loadStep(number) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.id) {
                throw new BadState(`Cannot load steps, if the process have no ID ${JSON.stringify(this.toJSON())}.`);
            }
            if (this.currentStep === undefined) {
                throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`);
            }
            const data = yield this.db('process_steps').where({ processId: this.id, number }).first();
            if (!data) {
                throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`);
            }
            this.steps[this.currentStep] = new ProcessStep(data);
            this.steps[this.currentStep].process = this;
            return this.steps[this.currentStep];
        });
    }
    /**
     * Execute process as long as it is completed, failed or requires additional input.
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let step;
            let MAX_RUNS = 100;
            while (true) {
                MAX_RUNS--;
                if (MAX_RUNS < 0) {
                    this.system.logger.error(`Maximum number of executions reached for the process ${this}.`);
                    break;
                }
                step = yield this.getCurrentStep();
                if (!step.directions.isImmediate()) {
                    yield this.updateStatus();
                    break;
                }
                const handler = this.system.getHandler(step.handler);
                const state = clone(step.state);
                const action = clone(step.directions.action);
                try {
                    if (action) {
                        const nextState = yield handler.action(action, state, this.files);
                        yield this.proceedToState(action, nextState);
                    }
                    else {
                        throw new BadState(`Process step ${step} has no action.`);
                    }
                }
                catch (err) {
                    this.system.logger.error(err);
                    return this.crashed(err);
                }
            }
        });
    }
    /**
     * Record the error and mark the process as finished with an error.
     * @param err
     */
    crashed(err) {
        return __awaiter(this, void 0, void 0, function* () {
            this.system.logger.error('Processing failed:', err);
            if (this.currentStep !== undefined && this.currentStep !== null) {
                const step = yield this.loadStep(this.currentStep);
                step.finished = new Date();
                yield step.save();
            }
            this.error = `${err.name}: ${err.message}`;
            yield this.save();
            yield this.updateStatus();
        });
    }
    /**
     * Resolve the status of the process and update it to the database.
     */
    updateStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let status = ProcessStatus.INCOMPLETE;
            if (this.error) {
                status = ProcessStatus.CRASHED;
            }
            else {
                if (this.currentStep === null || this.currentStep === undefined) {
                    throw new BadState(`Cannot check status when there is no current step loaded for ${this}`);
                }
                const step = this.steps[this.currentStep];
                if (step.finished) {
                    if (this.successful === true)
                        status = ProcessStatus.SUCCEEDED;
                    if (this.successful === false)
                        status = ProcessStatus.FAILED;
                }
                if (step.directions) {
                    status = step.directions.isImmediate() ? ProcessStatus.INCOMPLETE : ProcessStatus.WAITING;
                }
            }
            if (this.status !== status) {
                this.system.logger.info(`Process ${this} is now ${status}`);
            }
            this.status = status;
            yield this.db('processes').update({ status }).where({ id: this.id });
        });
    }
    /**
     * Get the state of the current step of the process.
     */
    get state() {
        if (this.currentStep === null || this.currentStep === undefined) {
            throw new BadState(`Cannot check state when there is no current step loaded for ${this}`);
        }
        const step = this.steps[this.currentStep];
        return step.state;
    }
    /**
     * Handle external input coming ing.
     * @param action
     */
    input(action) {
        return __awaiter(this, void 0, void 0, function* () {
            const step = yield this.getCurrentStep();
            const handler = this.system.getHandler(step.handler);
            let nextState;
            try {
                nextState = yield handler.action(action, clone(step.state), this.files);
            }
            catch (err) {
                return this.crashed(err);
            }
            yield this.proceedToState(action, nextState);
        });
    }
    /**
     * Roll back the latest step.
     */
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentStep === null || this.currentStep === undefined) {
                throw new BadState(`Cannot roll back when there is no current step.`);
            }
            if (this.currentStep < 1) {
                throw new BadState(`Cannot roll back when there is only initial step in the process.`);
            }
            const step = yield this.getCurrentStep();
            this.system.logger.info(`Attempt of rolling back '${step}' from '${this}'.`);
            const handler = this.system.getHandler(step.handler);
            const result = yield handler.rollback(step);
            if (result) {
                if (this.error) {
                    this.error = undefined;
                }
                yield this.db('process_steps').delete().where({ id: step.id });
                this.currentStep--;
                yield this.save();
                const newCurrentStep = yield this.getCurrentStep();
                newCurrentStep.finished = undefined;
                yield newCurrentStep.save();
                yield this.updateStatus();
                this.system.logger.info(`Roll back of '${this}' to '${newCurrentStep}' successful.`);
                return true;
            }
            this.system.logger.info(`Not able to roll back '${this}'.`);
            return false;
        });
    }
}
/**
 * A handler taking care of moving between process states.
 */
export class ProcessHandler {
    constructor(name) {
        this.name = name;
    }
    /**
     * Check if we are able to handle the given data.
     * @param file
     */
    canHandle(file) {
        throw new NotImplemented(`A handler '${this.name}' cannot handle file '${file.name}', since canHandle() is not implemented.`);
    }
    /**
     * Check if the state is either successful `true` or failed `false` or not yet complete `undefined`.
     * @param state
     */
    checkCompletion(state) {
        throw new NotImplemented(`A handler '${this.name}' cannot check state '${JSON.stringify(state)}', since checkCompletion() is not implemented.`);
    }
    /**
     * Execute an action to the state in order to produce new state. Note that state is cloned and can be modified to be new state.
     * @param action
     * @param state
     * @param files
     */
    action(action, state, files) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplemented(`A handler '${this.name}' for files ${files.map(f => `'${f}''`).join(', ')} does not implement action()`);
        });
    }
    /**
     * Construct intial state from the given data.
     * @param file
     */
    startingState(file) {
        throw new NotImplemented(`A handler '${this.name}' for file '${file.name}' does not implement startingState()`);
    }
    /**
     * Figure out possible directions from the given state.
     * @param state
     */
    getDirections(state) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplemented(`A handler '${this.name}' for state '${JSON.stringify(state)}' does not implement getDirections()`);
        });
    }
    /**
     * See if it is possible rollback a step.
     * @param step
     */
    rollback(step) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplemented(`A handler '${this.name}' for step '${step}' does not implement rollback()`);
        });
    }
}
/**
 * An instance of the full processing system.
 */
export class ProcessingSystem {
    /**
     * Initialize the system and set the database instance for storing process data.
     * @param db
     */
    constructor(db) {
        this.handlers = {};
        this.db = db;
        this.logger = {
            info: (...msg) => console.log(...msg),
            error: (...msg) => console.error(...msg)
        };
    }
    /**
     * Register new handler class for processing.
     * @param handler
     */
    register(handler) {
        if (handler.name in this.handlers) {
            throw new InvalidArgument(`The handler '${handler.name}' is already defined.`);
        }
        if (handler.name.length > 32) {
            throw new InvalidArgument(`The handler name '${handler.name}' is too long.`);
        }
        this.handlers[handler.name] = handler;
    }
    /**
     * Initialize new process and save it to the database.
     * @param type
     * @param name
     * @param file
     * @returns
     */
    createProcess(name, file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set up the process.
            const process = new Process(this, name);
            yield process.save();
            // Save the file and attach it to the process.
            const processFile = new ProcessFile(file);
            process.addFile(processFile);
            yield processFile.save(this.db);
            // Find the handler.
            let selectedHandler = null;
            for (const handler of Object.values(this.handlers)) {
                try {
                    if (handler.canHandle(processFile)) {
                        selectedHandler = handler;
                        break;
                    }
                }
                catch (err) {
                    yield process.crashed(err);
                    return process;
                }
            }
            if (!selectedHandler) {
                throw new InvalidArgument(`No handler found for the file ${file.name}.`);
            }
            // Create initial step using the handler.
            const state = selectedHandler.startingState(processFile);
            const step = new ProcessStep({
                number: 0,
                handler: selectedHandler.name,
                state
            });
            process.addStep(step);
            yield step.save();
            process.currentStep = 0;
            yield process.save();
            // Find directions forward from the initial state.
            yield this.checkFinishAndFindDirections(selectedHandler, step);
            return process;
        });
    }
    /**
     * Check if we are in the finished state and if not, find the directions forward.
     */
    checkFinishAndFindDirections(handler, step) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            try {
                result = handler.checkCompletion(step.state);
            }
            catch (err) {
                return step.process.crashed(err);
            }
            if (result === undefined) {
                const directions = yield handler.getDirections(step.state);
                yield step.setDirections(this.db, directions);
            }
            else {
                // Process is finished.
                step.directions = undefined;
                step.action = undefined;
                step.finished = new Date();
                yield step.save();
                step.process.complete = true;
                step.process.successful = result;
                yield step.process.save();
            }
            yield step.process.updateStatus();
        });
    }
    /**
     * Get the named handler or throw an error if not registered.
     * @param name
     * @returns
     */
    getHandler(name) {
        if (!(name in this.handlers)) {
            throw new InvalidArgument(`There is no handler for '${name}'.`);
        }
        return this.handlers[name];
    }
    /**
     * Load the process data from the disk.
     * @param id
     * @returns
     */
    loadProcess(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const process = new Process(this, null);
            yield process.load(id);
            return process;
        });
    }
}
