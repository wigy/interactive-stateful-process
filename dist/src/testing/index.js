"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CoinHandler = void 0;
var __1 = require("..");
// Handler for the process.
var CoinHandler = /** @class */ (function (_super) {
    __extends(CoinHandler, _super);
    function CoinHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CoinHandler.prototype.canHandle = function (file) {
        return /^#1,5,10/.test(file.data);
    };
    CoinHandler.prototype.startingState = function () {
        return {
            stage: 'empty',
            coin1: 0,
            coin5: 0,
            coin10: 0,
        };
    };
    CoinHandler.prototype.getDirections = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (state.stage) {
                    case 'empty':
                        return [2 /*return*/, new __1.Directions({
                                type: 'action',
                                action: { target: 'initialize' }
                            })];
                    case 'running':
                    case 'initialized':
                        return [2 /*return*/, new __1.Directions({
                                type: 'ui',
                                element: 'ask'
                            })];
                    default:
                        throw new __1.BadState("Cannot find directions from " + JSON.stringify(state));
                }
                return [2 /*return*/];
            });
        });
    };
    CoinHandler.prototype.action = function (action, state, files) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (action.target === 'initialize') {
                    files.forEach(function (f) {
                        var _a = f.data.split('\n')[1].split(',').map(function (n) { return parseInt(n); }), c1 = _a[0], c5 = _a[1], c10 = _a[2];
                        state.coin1 += c1;
                        state.coin5 += c5;
                        state.coin10 += c10;
                    });
                    state.stage = 'initialized';
                }
                else if (action.target === 'coin1') {
                    state.coin1 += action.count;
                    state.stage = 'running';
                }
                else if (action.target === 'coin5') {
                    state.coin5 += action.count;
                    state.stage = 'running';
                }
                else if (action.target === 'coin10') {
                    state.coin10 += action.count;
                    state.stage = 'running';
                }
                else if (action.target === 'trigger error') {
                    throw new Error('This error was intentionally triggered.');
                }
                return [2 /*return*/, state];
            });
        });
    };
    CoinHandler.prototype.checkCompletion = function (state) {
        if (state.stage === 'running') {
            // If any pile is negative, process fails.
            if (state.coin1 < 0 || state.coin5 < 0 || state.coin10 < 0) {
                return false;
            }
            // If any pile is over 10, process succeeds.
            if (state.coin1 > 10 || state.coin5 > 10 || state.coin10 > 10) {
                return true;
            }
        }
    };
    CoinHandler.prototype.rollback = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, coin1, coin5, coin10;
            return __generator(this, function (_b) {
                _a = step.state, coin1 = _a.coin1, coin5 = _a.coin5, coin10 = _a.coin10;
                return [2 /*return*/, coin1 !== 0 && coin5 !== 0 && coin10 !== 0];
            });
        });
    };
    return CoinHandler;
}(__1.ProcessHandler));
exports.CoinHandler = CoinHandler;
