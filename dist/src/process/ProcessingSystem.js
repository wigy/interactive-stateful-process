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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingSystem = void 0;
var __1 = require("..");
var Process_1 = require("./Process");
var ProcessFile_1 = require("./ProcessFile");
var ProcessStep_1 = require("./ProcessStep");
/**
 * An instance of the full processing system.
 */
var ProcessingSystem = /** @class */ (function () {
    /**
     * Initialize the system and set the database instance for storing process data.
     * @param db
     */
    function ProcessingSystem(db) {
        this.handlers = {};
        this.db = db;
        this.logger = {
            info: function () {
                var msg = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    msg[_i] = arguments[_i];
                }
                return console.log.apply(console, __spreadArray([new Date()], msg, false));
            },
            error: function () {
                var msg = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    msg[_i] = arguments[_i];
                }
                return console.error.apply(console, __spreadArray([new Date()], msg, false));
            }
        };
    }
    /**
     * Register new handler class for processing.
     * @param handler
     */
    ProcessingSystem.prototype.register = function (handler) {
        if (handler.name in this.handlers) {
            throw new __1.InvalidArgument("The handler '" + handler.name + "' is already defined.");
        }
        if (handler.name.length > 32) {
            throw new __1.InvalidArgument("The handler name '" + handler.name + "' is too long.");
        }
        this.handlers[handler.name] = handler;
    };
    /**
     * Initialize new process and save it to the database.
     * @param type
     * @param name
     * @param file
     * @returns New process that is already in crashed state, if no handler
     */
    ProcessingSystem.prototype.createProcess = function (name, file) {
        return __awaiter(this, void 0, void 0, function () {
            var process, processFile, selectedHandler, _i, _a, handler, err_1, state, step;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        process = new Process_1.Process(this, name);
                        return [4 /*yield*/, process.save()
                            // Save the file and attach it to the process.
                        ];
                    case 1:
                        _b.sent();
                        processFile = new ProcessFile_1.ProcessFile(file);
                        process.addFile(processFile);
                        return [4 /*yield*/, processFile.save(this.db)
                            // Find the handler.
                        ];
                    case 2:
                        _b.sent();
                        selectedHandler = null;
                        _i = 0, _a = Object.values(this.handlers);
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        handler = _a[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 5, , 7]);
                        if (handler.canHandle(processFile)) {
                            selectedHandler = handler;
                            return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _b.sent();
                        return [4 /*yield*/, process.crashed(err_1)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, process];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        if (!!selectedHandler) return [3 /*break*/, 10];
                        return [4 /*yield*/, process.crashed(new __1.InvalidArgument("No handler found for the file " + file.name + " of type " + file.type + "."))];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, process];
                    case 10:
                        state = selectedHandler.startingState(processFile);
                        step = new ProcessStep_1.ProcessStep({
                            number: 0,
                            handler: selectedHandler.name,
                            state: state
                        });
                        process.addStep(step);
                        return [4 /*yield*/, step.save()];
                    case 11:
                        _b.sent();
                        process.currentStep = 0;
                        return [4 /*yield*/, process.save()
                            // Find directions forward from the initial state.
                        ];
                    case 12:
                        _b.sent();
                        // Find directions forward from the initial state.
                        return [4 /*yield*/, this.checkFinishAndFindDirections(selectedHandler, step)];
                    case 13:
                        // Find directions forward from the initial state.
                        _b.sent();
                        return [2 /*return*/, process];
                }
            });
        });
    };
    /**
     * Check if we are in the finished state and if not, find the directions forward.
     */
    ProcessingSystem.prototype.checkFinishAndFindDirections = function (handler, step) {
        return __awaiter(this, void 0, void 0, function () {
            var result, directions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            result = handler.checkCompletion(step.state);
                        }
                        catch (err) {
                            return [2 /*return*/, step.process.crashed(err)];
                        }
                        if (!(result === undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, handler.getDirections(step.state)];
                    case 1:
                        directions = _a.sent();
                        return [4 /*yield*/, step.setDirections(this.db, directions)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        // Process is finished.
                        step.directions = undefined;
                        step.action = undefined;
                        step.finished = new Date();
                        return [4 /*yield*/, step.save()];
                    case 4:
                        _a.sent();
                        step.process.complete = true;
                        step.process.successful = result;
                        return [4 /*yield*/, step.process.save()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, step.process.updateStatus()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the named handler or throw an error if not registered.
     * @param name
     * @returns
     */
    ProcessingSystem.prototype.getHandler = function (name) {
        if (!(name in this.handlers)) {
            throw new __1.InvalidArgument("There is no handler for '" + name + "'.");
        }
        return this.handlers[name];
    };
    /**
     * Load the process data from the disk.
     * @param id
     * @returns
     */
    ProcessingSystem.prototype.loadProcess = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var process;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        process = new Process_1.Process(this, null);
                        return [4 /*yield*/, process.load(id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, process];
                }
            });
        });
    };
    return ProcessingSystem;
}());
exports.ProcessingSystem = ProcessingSystem;
