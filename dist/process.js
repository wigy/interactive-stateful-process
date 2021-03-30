import { InvalidArgument } from "./error";
export class Process {
}
export class ProcessHandler {
    isComplete(state) {
        // TODO: Implement.
        return false;
    }
    startingPoints(type) {
        return [];
    }
}
export class ProcessingSystem {
    constructor() {
        this.handlers = {};
    }
    register(name, handler) {
        if (name in this.handlers) {
            throw new InvalidArgument(`The handler for '${name}' is already defined.`);
        }
        this.handlers[name] = handler;
    }
    startingPoints(type) {
        let points = [];
        for (const [_, handler] of Object.entries(this.handlers)) {
            points = points.concat(handler.startingPoints(type));
        }
        return points;
    }
}
