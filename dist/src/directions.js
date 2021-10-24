"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directions = void 0;
/**
 * Data describing possible directions forward from the given state.
 */
class Directions {
    constructor(obj) {
        this.type = obj.type;
        this.element = obj.element;
        this.action = obj.action;
    }
    /**
     * Construct JSON data of the member fields that has been set.
     * @returns
     */
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
    /**
     * Check if the direction can be determined without user intervention.
     */
    isImmediate() {
        return this.type === 'action';
    }
    /**
     * Check if there are no directions forward.
     */
    isComplete() {
        return this.type === 'complete';
    }
}
exports.Directions = Directions;
