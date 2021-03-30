export class Process {
}
export class ProcessHandler {
    isComplete(state) {
        // TODO: Implement.
        return false;
    }
}
export class ProcessingSystem {
    register(name, handler) {
        // TODO: Checks
        this.handlers[name] = handler;
    }
    startingPoints(type) {
        // TODO: Implement.
    }
}
