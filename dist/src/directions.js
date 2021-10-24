"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directions = void 0;
/**
 * Data describing possible directions forward from the given state.
 */
var Directions = /** @class */ (function () {
    function Directions(obj) {
        this.type = obj.type;
        this.element = obj.element;
        this.action = obj.action;
    }
    /**
     * Construct JSON data of the member fields that has been set.
     * @returns
     */
    Directions.prototype.toJSON = function () {
        var ret = {
            type: this.type
        };
        if (this.element) {
            ret.element = this.element;
        }
        if (this.action) {
            ret.action = this.action;
        }
        return ret;
    };
    /**
     * Check if the direction can be determined without user intervention.
     */
    Directions.prototype.isImmediate = function () {
        return this.type === 'action';
    };
    /**
     * Check if there are no directions forward.
     */
    Directions.prototype.isComplete = function () {
        return this.type === 'complete';
    };
    return Directions;
}());
exports.Directions = Directions;
