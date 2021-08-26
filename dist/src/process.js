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
export class ProcessStep {
    constructor(obj) {
        this.directions = obj.directions;
        this.action = obj.action;
        this.number = obj.number;
        this.started = obj.started;
        this.state = obj.state;
        this.finished = obj.finished;
    }
}
export class Process {
    constructor(name = null, origin = null) {
        this.id = null;
        this.name = name === null ? '[unknown]' : name,
            this.complete = false;
        this.successful = undefined;
        this.origin = origin === null ? { type: '[unknown]' } : origin,
            this.files = [];
        this.steps = [];
        this.currentStep = undefined;
    }
    get dbData() {
        return {
            name: this.name,
            complete: this.complete,
            successful: this.successful,
            origin: this.origin,
            currentStep: this.currentStep,
        };
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
            this.origin = data.origin;
            this.currentStep = data.currentStep;
            this.files = [];
            this.steps = [];
            return this;
        });
    }
    loadCurrentStep(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.id) {
                throw new BadState(`Cannot load steps, if process have no ID ${JSON.stringify(this.dbData)}.`);
            }
            if (this.currentStep === undefined) {
                throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.dbData)}.`);
            }
            const data = yield db('process_steps').where({ id: this.id, number: this.currentStep }).first();
            if (!data) {
                throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.dbData)}.`);
            }
            this.steps[this.currentStep] = new ProcessStep(data);
            return this.steps[this.currentStep];
        });
    }
}
export class ProcessHandler {
    constructor(name) {
        this.name = name;
    }
    isComplete(state) {
        // TODO: Implement.
        return false;
    }
    startingDirections(type) {
        throw new NotImplemented(`A handler '${this.name}' does not implement startingPoint()`);
    }
    startingState(type) {
        throw new NotImplemented(`A handler '${this.name}' does not implement startingState()`);
    }
}
export class ProcessingSystem {
    constructor() {
        this.db = null;
        this.handlers = {};
    }
    register(handler) {
        if (handler.name in this.handlers) {
            throw new InvalidArgument(`The handler '${handler}' is already defined.`);
        }
        this.handlers[handler.name] = handler;
    }
    startingDirections(type) {
        const points = [];
        for (const [_, handler] of Object.entries(this.handlers)) {
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
    useKnex(knex) {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = knex;
        });
    }
    getDb() {
        if (this.db) {
            return this.db;
        }
        throw new BadState(`Database is not yet set.`);
    }
    createProcess(type, name, origin) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this.getHandler(name);
            // Set up the process.
            const process = new Process(name, origin);
            const db = this.getDb();
            const processId = (yield this.getDb()('processes').insert(process.dbData).returning('id'))[0];
            process.id = processId;
            // Get the initial state.
            const init = handler.startingDirections(type);
            if (!init) {
                throw new BadState(`Trying to find starting directions from handler '${name}' for '${type}' and got null.`);
            }
            const state = handler.startingState(type);
            const step = { processId, state, action: null, number: 0, directions: init.dbData };
            yield this.getDb()('process_steps').insert(step);
            yield this.getDb()('processes').update({ currentStep: 0 }).where({ id: processId });
            return process;
        });
    }
    loadProcess(processId) {
        return __awaiter(this, void 0, void 0, function* () {
            const process = yield (new Process()).load(this.getDb(), processId);
            return process;
        });
    }
    handleAction(processId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!processId) {
                throw new InvalidArgument(`Process ID not given when trying to handle action ${JSON.stringify(action.dbData)}.`);
            }
            // Load data needed.
            const process = yield this.loadProcess(processId);
            const step = yield process.loadCurrentStep(this.getDb());
            console.log(step);
            const handler = this.getHandler(action.process);
            return false;
        });
    }
}
