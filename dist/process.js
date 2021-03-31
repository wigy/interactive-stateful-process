import { InvalidArgument, NotImplemented } from "./error";
export class Process {
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
    createProcess(action) {
        return 1;
    }
}
