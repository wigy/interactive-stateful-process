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
var src_1 = require("../src");
var knex_1 = __importDefault(require("knex"));
var testing_1 = require("../src/testing");
var DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test';
test('process handling with coins', function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, system, sample, process, copy, failing, process2, badSample, failingProcess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, knex_1.default)(DATABASE_URL);
                return [4 /*yield*/, db.migrate.latest()];
            case 1:
                _a.sent();
                system = new src_1.ProcessingSystem(db);
                // Set up the system.
                system.register(new testing_1.CoinHandler('Coin Pile Adder'));
                system.logger.info = function () { return undefined; };
                sample = {
                    name: 'sample.txt',
                    encoding: 'utf-8',
                    data: '#1,5,10\n2,4,10\n'
                };
                return [4 /*yield*/, system.createProcess('Handle 3 stacks of coins', sample)];
            case 2:
                process = _a.sent();
                expect(process.status).toBe(src_1.ProcessStatus.INCOMPLETE);
                expect(process.state).toStrictEqual({
                    stage: 'empty',
                    coin1: 0,
                    coin5: 0,
                    coin10: 0,
                });
                // Let it run a bit.
                return [4 /*yield*/, process.run()];
            case 3:
                // Let it run a bit.
                _a.sent();
                expect(process.status).toBe(src_1.ProcessStatus.WAITING);
                expect(process.state).toStrictEqual({
                    stage: 'initialized',
                    coin1: 2,
                    coin5: 4,
                    coin10: 10,
                });
                // Give some manual input.
                return [4 /*yield*/, process.input({ target: 'coin1', count: +4 })];
            case 4:
                // Give some manual input.
                _a.sent();
                return [4 /*yield*/, process.input({ target: 'coin5', count: +0 })];
            case 5:
                _a.sent();
                return [4 /*yield*/, process.input({ target: 'coin10', count: -8 })];
            case 6:
                _a.sent();
                expect(process.status).toBe(src_1.ProcessStatus.WAITING);
                expect(process.state).toStrictEqual({
                    stage: 'running',
                    coin1: 6,
                    coin5: 4,
                    coin10: 2,
                });
                return [4 /*yield*/, system.loadProcess(process.id)];
            case 7:
                copy = _a.sent();
                expect(copy.status).toBe(src_1.ProcessStatus.WAITING);
                expect(copy.state).toStrictEqual({
                    stage: 'running',
                    coin1: 6,
                    coin5: 4,
                    coin10: 2,
                });
                // Pump it to the finish.
                return [4 /*yield*/, copy.input({ target: 'coin1', count: +5 })];
            case 8:
                // Pump it to the finish.
                _a.sent();
                expect(copy.status).toBe(src_1.ProcessStatus.SUCCEEDED);
                expect(copy.state).toStrictEqual({
                    stage: 'running',
                    coin1: 11,
                    coin5: 4,
                    coin10: 2,
                });
                return [4 /*yield*/, system.createProcess('Intentional crash with coins', sample)];
            case 9:
                failing = _a.sent();
                expect(failing.status).toBe(src_1.ProcessStatus.INCOMPLETE);
                expect(failing.state).toStrictEqual({
                    stage: 'empty',
                    coin1: 0,
                    coin5: 0,
                    coin10: 0,
                });
                return [4 /*yield*/, failing.run()];
            case 10:
                _a.sent();
                expect(failing.status).toBe(src_1.ProcessStatus.WAITING);
                expect(failing.state).toStrictEqual({
                    stage: 'initialized',
                    coin1: 2,
                    coin5: 4,
                    coin10: 10,
                });
                // Make it crash.
                system.logger.error = function () { return undefined; };
                return [4 /*yield*/, failing.input({ target: 'trigger error' })];
            case 11:
                _a.sent();
                expect(failing.status).toBe(src_1.ProcessStatus.CRASHED);
                expect(failing.state).toStrictEqual({
                    stage: 'initialized',
                    coin1: 2,
                    coin5: 4,
                    coin10: 10,
                });
                return [4 /*yield*/, system.createProcess('Rolling back with coins', sample)];
            case 12:
                process2 = _a.sent();
                expect(process2.status).toBe(src_1.ProcessStatus.INCOMPLETE);
                expect(process2.state).toStrictEqual({
                    stage: 'empty',
                    coin1: 0,
                    coin5: 0,
                    coin10: 0,
                });
                return [4 /*yield*/, process2.run()];
            case 13:
                _a.sent();
                expect(process2.status).toBe(src_1.ProcessStatus.WAITING);
                expect(process2.state).toStrictEqual({
                    stage: 'initialized',
                    coin1: 2,
                    coin5: 4,
                    coin10: 10,
                });
                return [4 /*yield*/, process2.input({ target: 'coin5', count: +6 })];
            case 14:
                _a.sent();
                expect(process2.status).toBe(src_1.ProcessStatus.WAITING);
                expect(process2.state).toStrictEqual({
                    stage: 'running',
                    coin1: 2,
                    coin5: 10,
                    coin10: 10,
                });
                // Now roll back steps.
                return [4 /*yield*/, process2.rollback()];
            case 15:
                // Now roll back steps.
                _a.sent();
                expect(process2.status).toBe(src_1.ProcessStatus.WAITING);
                expect(process2.state).toStrictEqual({
                    stage: 'initialized',
                    coin1: 2,
                    coin5: 4,
                    coin10: 10,
                });
                return [4 /*yield*/, process2.rollback()];
            case 16:
                _a.sent();
                expect(process2.status).toBe(src_1.ProcessStatus.INCOMPLETE);
                expect(process2.state).toStrictEqual({
                    stage: 'empty',
                    coin1: 0,
                    coin5: 0,
                    coin10: 0,
                });
                badSample = {
                    name: 'bad.txt',
                    encoding: 'utf-8',
                    data: 'rubbish\n'
                };
                return [4 /*yield*/, system.createProcess('Try bad file', badSample)];
            case 17:
                failingProcess = _a.sent();
                expect(failingProcess.status).toBe(src_1.ProcessStatus.CRASHED);
                expect(failingProcess.error).toBeTruthy();
                // console.log('PROCESSES', await db('processes').select('*'))
                // console.log('FILES', await db('process_files').select('*'))
                // console.log('STEPS', await db('process_steps').select('*'))
                return [4 /*yield*/, db.migrate.rollback()];
            case 18:
                // console.log('PROCESSES', await db('processes').select('*'))
                // console.log('FILES', await db('process_files').select('*'))
                // console.log('STEPS', await db('process_steps').select('*'))
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
