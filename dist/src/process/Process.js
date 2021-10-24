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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process = void 0;
var clone_1 = __importDefault(require("clone"));
var __1 = require("..");
var ProcessFile_1 = require("./ProcessFile");
var ProcessStep_1 = require("./ProcessStep");
/**
 * A complete description of the process state and steps taken.
 */
var Process = /** @class */ (function () {
    function Process(system, name) {
        this.system = system;
        this.id = null;
        this.name = name || '[no name]';
        this.complete = false;
        this.successful = undefined;
        this.files = [];
        this.steps = [];
        this.currentStep = undefined;
        this.status = __1.ProcessStatus.INCOMPLETE;
    }
    Process.prototype.toString = function () {
        return "Process #" + this.id + " " + this.name;
    };
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    Process.prototype.toJSON = function () {
        return {
            name: this.name,
            complete: this.complete,
            successful: this.successful,
            currentStep: this.currentStep,
            status: this.status,
            error: this.error
        };
    };
    /**
     * Append a file to this process and link its ID.
     * @param file
     */
    Process.prototype.addFile = function (file) {
        file.processId = this.id;
        this.files.push(file);
    };
    /**
     * Append a step to this process and link its ID.
     * @param step
     */
    Process.prototype.addStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                step.processId = this.id;
                step.process = this;
                this.steps.push(step);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Load the current step if necessary and return it.
     */
    Process.prototype.getCurrentStep = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.currentStep === null || this.currentStep === undefined) {
                    throw new __1.BadState("Process #" + this.id + " " + this.name + " has invalid current step.");
                }
                if (this.steps[this.currentStep]) {
                    return [2 /*return*/, this.steps[this.currentStep]];
                }
                return [2 /*return*/, this.loadStep(this.currentStep)];
            });
        });
    };
    /**
     * Mark the current state as completed and create new additional step with the new state.
     * @param state
     */
    Process.prototype.proceedToState = function (action, state) {
        return __awaiter(this, void 0, void 0, function () {
            var current, handler, nextStep;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentStep()];
                    case 1:
                        current = _a.sent();
                        handler = this.system.getHandler(current.handler);
                        current.action = action;
                        current.finished = new Date();
                        current.save();
                        nextStep = new ProcessStep_1.ProcessStep({
                            number: current.number + 1,
                            state: state,
                            handler: handler.name
                        });
                        this.addStep(nextStep);
                        this.currentStep = (this.currentStep || 0) + 1;
                        this.save();
                        return [4 /*yield*/, nextStep.save()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.system.checkFinishAndFindDirections(handler, nextStep)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Process.prototype, "db", {
        /**
         * Get a reference to the database.
         */
        get: function () {
            return this.system.db;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Save the process info to the database.
     */
    Process.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db('processes').update(this.toJSON()).where({ id: this.id })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, this.id];
                    case 2:
                        _a = this;
                        return [4 /*yield*/, this.db('processes').insert(this.toJSON()).returning('id')];
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
     * Load the process data and its files. Note that current step is not yet loaded here, but when using getCurrentStep().
     * @param id
     */
    Process.prototype.load = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db('processes').select('*').where({ id: id }).first()];
                    case 1:
                        data = _b.sent();
                        if (!data) {
                            throw new __1.InvalidArgument("Cannot find process #" + id);
                        }
                        Object.assign(this, data);
                        this.id = id;
                        // Load files.
                        _a = this;
                        return [4 /*yield*/, this.db('process_files').select('*').where({ processId: this.id })];
                    case 2:
                        // Load files.
                        _a.files = (_b.sent()).map(function (fileData) {
                            var file = new ProcessFile_1.ProcessFile(fileData);
                            file.id = fileData.id;
                            return file;
                        });
                        // Load current step.
                        return [4 /*yield*/, this.getCurrentStep()];
                    case 3:
                        // Load current step.
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load the step with the given number from the database.
     * @param number
     * @returns
     */
    Process.prototype.loadStep = function (number) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.id) {
                            throw new __1.BadState("Cannot load steps, if the process have no ID " + JSON.stringify(this.toJSON()) + ".");
                        }
                        if (this.currentStep === undefined) {
                            throw new __1.BadState("Cannot load any steps, since process have no current step " + JSON.stringify(this.toJSON()) + ".");
                        }
                        return [4 /*yield*/, this.db('process_steps').where({ processId: this.id, number: number }).first()];
                    case 1:
                        data = _a.sent();
                        if (!data) {
                            throw new __1.BadState("Cannot find step " + this.currentStep + " for process " + JSON.stringify(this.toJSON()) + ".");
                        }
                        this.steps[this.currentStep] = new ProcessStep_1.ProcessStep(data);
                        this.steps[this.currentStep].process = this;
                        return [2 /*return*/, this.steps[this.currentStep]];
                }
            });
        });
    };
    /**
     * Check if the process can be run.
     */
    Process.prototype.canRun = function () {
        return !this.complete && (this.status === __1.ProcessStatus.INCOMPLETE || this.status === __1.ProcessStatus.WAITING);
    };
    /**
     * Execute process as long as it is completed, failed or requires additional input.
     */
    Process.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var step, MAX_RUNS, handler, state, action, nextState, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MAX_RUNS = 100;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 12];
                        MAX_RUNS--;
                        if (MAX_RUNS < 0) {
                            this.system.logger.error("Maximum number of executions reached for the process " + this + ".");
                            return [3 /*break*/, 12];
                        }
                        return [4 /*yield*/, this.getCurrentStep()];
                    case 2:
                        step = _a.sent();
                        if (!!step.directions.isImmediate()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.updateStatus()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 4:
                        handler = this.system.getHandler(step.handler);
                        state = (0, clone_1.default)(step.state);
                        action = (0, clone_1.default)(step.directions.action);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 10, , 11]);
                        if (!action) return [3 /*break*/, 8];
                        return [4 /*yield*/, handler.action(action, state, this.files)];
                    case 6:
                        nextState = _a.sent();
                        return [4 /*yield*/, this.proceedToState(action, nextState)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8: throw new __1.BadState("Process step " + step + " has no action.");
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        err_1 = _a.sent();
                        this.system.logger.error(err_1);
                        return [2 /*return*/, this.crashed(err_1)];
                    case 11: return [3 /*break*/, 1];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Record the error and mark the process as finished with an error.
     * @param err
     */
    Process.prototype.crashed = function (err) {
        return __awaiter(this, void 0, void 0, function () {
            var step;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.system.logger.error("Processing of " + this + " failed:", err);
                        if (!(this.currentStep !== undefined && this.currentStep !== null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadStep(this.currentStep)];
                    case 1:
                        step = _a.sent();
                        step.finished = new Date();
                        return [4 /*yield*/, step.save()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.error = err.stack ? err.stack : err.name + ": " + err.message;
                        return [4 /*yield*/, this.save()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.updateStatus()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve the status of the process and update it to the database.
     */
    Process.prototype.updateStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status, step;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        status = __1.ProcessStatus.INCOMPLETE;
                        if (this.error) {
                            status = __1.ProcessStatus.CRASHED;
                        }
                        else {
                            if (this.currentStep === null || this.currentStep === undefined) {
                                throw new __1.BadState("Cannot check status when there is no current step loaded for " + this);
                            }
                            step = this.steps[this.currentStep];
                            if (step.finished) {
                                if (this.successful === true)
                                    status = __1.ProcessStatus.SUCCEEDED;
                                if (this.successful === false)
                                    status = __1.ProcessStatus.FAILED;
                            }
                            if (step.directions) {
                                status = step.directions.isImmediate() ? __1.ProcessStatus.INCOMPLETE : __1.ProcessStatus.WAITING;
                            }
                        }
                        if (this.status !== status) {
                            this.system.logger.info("Process " + this + " is now " + status);
                        }
                        this.status = status;
                        return [4 /*yield*/, this.db('processes').update({ status: status }).where({ id: this.id })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Process.prototype, "state", {
        /**
         * Get the state of the current step of the process.
         */
        get: function () {
            if (this.currentStep === null || this.currentStep === undefined) {
                throw new __1.BadState("Cannot check state when there is no current step loaded for " + this);
            }
            var step = this.steps[this.currentStep];
            return step.state;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Handle external input coming ing.
     * @param action
     */
    Process.prototype.input = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var step, handler, nextState, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentStep()];
                    case 1:
                        step = _a.sent();
                        handler = this.system.getHandler(step.handler);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, handler.action(action, (0, clone_1.default)(step.state), this.files)];
                    case 3:
                        nextState = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        return [2 /*return*/, this.crashed(err_2)];
                    case 5: return [4 /*yield*/, this.proceedToState(action, nextState)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Roll back the latest step.
     */
    Process.prototype.rollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            var step, handler, result, newCurrentStep;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.currentStep === null || this.currentStep === undefined) {
                            throw new __1.BadState("Cannot roll back when there is no current step.");
                        }
                        if (this.currentStep < 1) {
                            throw new __1.BadState("Cannot roll back when there is only initial step in the process.");
                        }
                        return [4 /*yield*/, this.getCurrentStep()];
                    case 1:
                        step = _a.sent();
                        this.system.logger.info("Attempt of rolling back '" + step + "' from '" + this + "'.");
                        handler = this.system.getHandler(step.handler);
                        return [4 /*yield*/, handler.rollback(step)];
                    case 2:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 8];
                        if (this.error) {
                            this.error = undefined;
                        }
                        return [4 /*yield*/, this.db('process_steps').delete().where({ id: step.id })];
                    case 3:
                        _a.sent();
                        this.currentStep--;
                        return [4 /*yield*/, this.save()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.getCurrentStep()];
                    case 5:
                        newCurrentStep = _a.sent();
                        newCurrentStep.finished = undefined;
                        return [4 /*yield*/, newCurrentStep.save()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.updateStatus()];
                    case 7:
                        _a.sent();
                        this.system.logger.info("Roll back of '" + this + "' to '" + newCurrentStep + "' successful.");
                        return [2 /*return*/, true];
                    case 8:
                        this.system.logger.info("Not able to roll back '" + this + "'.");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return Process;
}());
exports.Process = Process;
