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
import { DatabaseError } from "./error";
/**
 * An instance of file data for processing.
 */
export class ProcessFile {
    constructor(obj) {
        this.id = null;
        this.processId = obj.processId || null;
        this.name = obj.name;
        this.encoding = obj.encoding;
        this.data = obj.data;
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
        this.started = obj.started;
        this.finished = obj.finished;
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
            handler: this.handler,
            started: this.started,
            finished: this.finished,
        };
    }
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
     * Append a step to this process and link its ID. Increase current step.
     * @param step
     */
    addStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            step.processId = this.id;
            step.process = this;
            this.steps.push(step);
            this.currentStep = this.steps.length - 1;
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
                if (handler.canHandle(processFile)) {
                    selectedHandler = handler;
                    break;
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
            yield process.save();
            // Find directions forward from the state.
            const directions = yield selectedHandler.getDirections(state);
            yield step.setDirections(this.db, directions);
            return process;
        });
    }
    run(process) {
        // TODO: Delegate processing.
        return;
    }
}
