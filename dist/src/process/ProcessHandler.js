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
exports.ProcessHandler = void 0;
var __1 = require("..");
/**
 * A handler taking care of moving between process states.
 */
var ProcessHandler = /** @class */ (function () {
    function ProcessHandler(name) {
        this.name = name;
    }
    /**
     * Check if we are able to handle the given data.
     * @param file
     */
    ProcessHandler.prototype.canHandle = function (file) {
        throw new __1.NotImplemented("A handler '" + this.name + "' cannot handle file '" + file.name + "', since canHandle() is not implemented.");
    };
    /**
     * Check if the state is either successful `true` or failed `false` or not yet complete `undefined`.
     * @param state
     */
    ProcessHandler.prototype.checkCompletion = function (state) {
        throw new __1.NotImplemented("A handler '" + this.name + "' cannot check state '" + JSON.stringify(state) + "', since checkCompletion() is not implemented.");
    };
    /**
     * Execute an action to the state in order to produce new state. Note that state is cloned and can be modified to be new state.
     * @param action
     * @param state
     * @param files
     */
    ProcessHandler.prototype.action = function (action, state, files) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new __1.NotImplemented("A handler '" + this.name + "' for files " + files.map(function (f) { return "'" + f + "''"; }).join(', ') + " does not implement action()");
            });
        });
    };
    /**
     * Construct intial state from the given data.
     * @param file
     */
    ProcessHandler.prototype.startingState = function (file) {
        throw new __1.NotImplemented("A handler '" + this.name + "' for file '" + file.name + "' does not implement startingState()");
    };
    /**
     * Figure out possible directions from the given state.
     * @param state
     */
    ProcessHandler.prototype.getDirections = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new __1.NotImplemented("A handler '" + this.name + "' for state '" + JSON.stringify(state) + "' does not implement getDirections()");
            });
        });
    };
    /**
     * See if it is possible rollback a step.
     * @param step
     */
    ProcessHandler.prototype.rollback = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new __1.NotImplemented("A handler '" + this.name + "' for step '" + step + "' does not implement rollback()");
            });
        });
    };
    return ProcessHandler;
}());
exports.ProcessHandler = ProcessHandler;
