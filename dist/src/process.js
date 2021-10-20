var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BadState, InvalidArgument, NotFound, NotImplemented } from "./error";
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
            // TODO: Handle JSON encoding, if used.
            if (this.id) {
                yield db('process_files').update(this.toJSON()).where({ id: this.id });
                return this.id;
            }
            else {
                this.id = (yield db('process_files').insert(this.toJSON()).returning('id'))[0];
                if (this.id)
                    return this.id;
                throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
            }
        });
    }
}
/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
export class ProcessStep {
    constructor(obj) {
        this.processId = obj.processId;
        this.number = obj.number;
        this.state = obj.state;
        this.handler = obj.handler;
        this.started = obj.started;
        this.finished = obj.finished;
    }
    /**
     * Save the process info to the database.
     */
    save(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id) {
                yield db('process_steps').update(this.toJSON()).where({ id: this.id });
                return this.id;
            }
            else {
                this.id = (yield db('process_steps').insert(this.toJSON()).returning('id'))[0];
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
}
/**
 * A complete description of the process state and steps taken.
 */
export class Process {
    constructor(name) {
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
     * Save the process info to the database.
     */
    save(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id) {
                yield db('processes').update(this.toJSON()).where({ id: this.id });
                return this.id;
            }
            else {
                this.id = (yield db('processes').insert(this.toJSON()).returning('id'))[0];
                if (this.id)
                    return this.id;
                throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
            }
        });
    }
    load(db, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield db('processes').where({ id }).first();
            if (!data) {
                throw new NotFound(`Cannot find process with ID = ${id}.`);
            }
            this.id = id;
            this.name = data.name;
            this.complete = data.complete;
            this.successful = data.successful;
            this.currentStep = data.currentStep;
            this.files = [];
            this.steps = [];
            return this;
        });
    }
    loadCurrentStep(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.id) {
                throw new BadState(`Cannot load steps, if process have no ID ${JSON.stringify(this.toJSON())}.`);
            }
            if (this.currentStep === undefined) {
                throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`);
            }
            const data = yield db('process_steps').where({ id: this.id, number: this.currentStep }).first();
            if (!data) {
                throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`);
            }
            this.steps[this.currentStep] = new ProcessStep(data);
            return this.steps[this.currentStep];
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
    startingDirections(type) {
        throw new NotImplemented(`A handler '${this.name}' of type '${type}' does not implement startingPoint()`);
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
    createProcess(type, name, file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set up the process.
            const process = new Process(name);
            yield process.save(this.db);
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
                processId: process.id,
                number: 0,
                handler: selectedHandler.name,
                state
            });
            yield step.save(this.db);
            return process;
        });
    }
    startingDirections(type) {
        const points = [];
        for (const handler of Object.values(this.handlers)) {
            const point = handler.startingDirections(type);
            if (point) {
                points.push(point);
            }
        }
        return points;
    }
    getHandler(name) {
        if (!(name in this.handlers)) {
            throw new InvalidArgument(`There is no handler for '${name}'.`);
        }
        return this.handlers[name];
    }
    OldcreateProcess(type, name, origin) {
        /*
             const handler = this.getHandler(name)
        
        
            // Get the initial state.
            const init = handler.startingDirections(type)
            if (!init) {
              throw new BadState(`Trying to find starting directions from handler '${name}' for '${type}' and got null.`)
            }
            const state = handler.startingState(type)
            const step = { processId, state, action: null, number: 0, directions: init.toJSON() }
            await this.db('process_steps').insert(step)
            await this.db('processes').update({ currentStep: 0 }).where({ id: processId })
        
            return process
            */
    }
}
