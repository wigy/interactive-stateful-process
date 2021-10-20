export class Action {
    constructor(obj) {
        this.process = obj.process;
        this.action = obj.action;
        this.data = obj.data;
    }
    toJSON() {
        return {
            process: this.process,
            action: this.action,
            data: this.data,
        };
    }
}
