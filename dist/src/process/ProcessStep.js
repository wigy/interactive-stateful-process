"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStep = void 0;
var __1 = require("..");
/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
var ProcessStep = /** @class */ (function () {
    function ProcessStep(obj) {
        this.processId = obj.processId || null;
        this.number = obj.number;
        this.state = obj.state;
        this.handler = obj.handler;
        this.directions = obj.directions ? new __1.Directions(obj.directions) : undefined;
        this.action = obj.action;
        this.started = obj.started;
        this.finished = obj.finished;
    }
    ProcessStep.prototype.toString = function () {
        return "ProcessStep " + this.number + " of Process #" + this.processId;
    };
    Object.defineProperty(ProcessStep.prototype, "db", {
        /**
         * Get a reference to the database.
         */
        get: function () {
            return this.process.db;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Save the process info to the database.
     */
    ProcessStep.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db('process_steps').update(this.toJSON()).where({ id: this.id })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, this.id];
                    case 2:
                        this.started = new Date();
                        _a = this;
                        return [4 /*yield*/, this.db('process_steps').insert(this.toJSON()).returning('id')];
                    case 3:
                        _a.id = (_b.sent())[0];
                        if (this.id)
                            return [2 /*return*/, this.id];
                        throw new __1.DatabaseError("Saving process " + JSON.stringify(this.toJSON) + " failed.");
                }
            });
        });
    };
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    ProcessStep.prototype.toJSON = function () {
        return {
            processId: this.processId,
            number: this.number,
            state: this.state,
            directions: this.directions,
            handler: this.handler,
            action: this.action,
            started: this.started,
            finished: this.finished,
        };
    };
    /**
     * Set directions and update database.
     * @param db
     * @param directions
     */
    ProcessStep.prototype.setDirections = function (db, directions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.directions = directions;
                        return [4 /*yield*/, db('process_steps').update({ directions: directions.toJSON() }).where({ id: this.id })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProcessStep;
}());
exports.ProcessStep = ProcessStep;
