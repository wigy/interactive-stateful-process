/**
 * Data describing possible directions forward from the given state.
 */
export class Directions {
    constructor(obj) {
        this.type = obj.type;
        this.element = obj.element;
        this.action = obj.action;
    }
    toJSON() {
        const ret = {
            type: this.type
        };
        if (this.element) {
            ret.element = this.element;
        }
        if (this.action) {
            ret.action = this.action;
        }
        return ret;
    }
}
