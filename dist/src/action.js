export class Action {
    constructor(obj) {
        this.process = obj.process;
        this.action = obj.action;
        this.data = obj.data;
    }
    get dbData() {
        return {
            process: this.process,
            action: this.action,
            data: this.data,
        };
    }
}
