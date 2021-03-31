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
import Knex from 'knex';
export class ProcessStep {
}
export class Process {
    constructor(name, origin) {
        this.id = null;
        this.name = name;
        this.complete = false;
        this.successful = undefined;
        this.origin = origin;
        this.files = [];
        this.steps = [];
        this.currentStep = undefined;
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
    startingPoint(type) {
        throw new NotImplemented(`A handler '${this.name}' does not implement startingPoint()`);
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
    startingPoints(type) {
        const points = [];
        for (const [_, handler] of Object.entries(this.handlers)) {
            const point = handler.startingPoint(type);
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
    createProcess(type, action, origin) {
        const handler = this.getHandler(action.process);
        const id = 1;
        const process = new Process(action.process, origin);
        // TODO: Save to database.
        return id;
    }
    useKnex(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = Knex(config);
        });
    }
}
