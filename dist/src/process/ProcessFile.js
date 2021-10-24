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
exports.ProcessFile = void 0;
var chardet_1 = __importDefault(require("chardet"));
var __1 = require("..");
/**
 * An instance of input data for processing.
 */
var ProcessFile = /** @class */ (function () {
    function ProcessFile(obj) {
        this.id = null;
        this.processId = obj.processId || null;
        this.name = obj.name;
        this.type = obj.type;
        this.encoding = obj.encoding;
        this.data = obj.data;
        this.decoded = undefined;
    }
    ProcessFile.prototype.toString = function () {
        return "ProcessFile #" + this.id + " " + this.name;
    };
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    ProcessFile.prototype.toJSON = function () {
        return {
            processId: this.processId,
            name: this.name,
            type: this.type,
            encoding: this.encoding,
            data: this.data
        };
    };
    /**
     * Save the file to the database.
     */
    ProcessFile.prototype.save = function (db) {
        return __awaiter(this, void 0, void 0, function () {
            var out, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        out = this.toJSON();
                        if (this.encoding === 'json') {
                            out.data = JSON.stringify(out.data);
                        }
                        if (!this.id) return [3 /*break*/, 2];
                        return [4 /*yield*/, db('process_files').update(out).where({ id: this.id })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, this.id];
                    case 2:
                        _a = this;
                        return [4 /*yield*/, db('process_files').insert(out).returning('id')];
                    case 3:
                        _a.id = (_b.sent())[0];
                        if (this.id)
                            return [2 /*return*/, this.id];
                        throw new __1.DatabaseError("Saving process " + JSON.stringify(out) + " failed.");
                }
            });
        });
    };
    /**
     * Check if the first line of the text file matches to the regular expression.
     * @param re
     */
    ProcessFile.prototype.firstLineMatch = function (re) {
        var str = this.decode();
        var n = str.indexOf('\n');
        var line1 = n < 0 ? str : str.substr(0, n).trim();
        return re.test(line1);
    };
    /**
     * Find out if the content is binary or text.
     *
     * The mime type has to start with `text/`.
     */
    ProcessFile.prototype.isTextFile = function () {
        var _a;
        return ((_a = this.type) === null || _a === void 0 ? void 0 : _a.startsWith('text/')) || false;
    };
    /**
     * Convert chardet encoding to the supported buffer encoding
     * "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
     */
    ProcessFile.prototype.parseEncoding = function (encoding) {
        switch (encoding.toUpperCase()) {
            case 'UTF-8':
                return 'utf-8';
            case 'ISO-8859-1':
                return 'latin1';
            case 'UTF-16LE':
                return 'utf16le';
            default:
                throw new __1.InvalidFile("Not able to map text encoding " + encoding + ".");
        }
    };
    /**
     * Try to recognize the file content and decode if it is a recognizable text format.
     */
    ProcessFile.prototype.decode = function () {
        if (this.decoded) {
            return this.decoded;
        }
        switch (this.encoding) {
            case 'base64':
                var buffer = Buffer.from(this.data, 'base64');
                var encoding = chardet_1.default.detect(buffer);
                if (!encoding) {
                    throw new __1.InvalidFile("Cannot determine encoding for '" + this + "'.");
                }
                this.decoded = buffer.toString(this.parseEncoding(encoding));
                return this.decoded;
            default:
                throw new __1.InvalidFile("An encoding '" + this.encoding + "' is not yet supported.");
        }
    };
    return ProcessFile;
}());
exports.ProcessFile = ProcessFile;
