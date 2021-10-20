export class Directions {
    constructor(obj) {
        this.title = obj.title;
        this.process = obj.process;
        this.type = obj.type;
        this.step = obj.step;
        this.description = obj.description;
        this.content = obj.content;
    }
    toJSON() {
        return {
            title: this.title,
            process: this.process,
            type: this.type,
            step: this.step,
            description: this.description,
            content: this.content,
        };
    }
}
