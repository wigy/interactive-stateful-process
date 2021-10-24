"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessFile = void 0;
const chardet_1 = __importDefault(require("chardet"));
const __1 = require("..");
/**
 * An instance of input data for processing.
 */
class ProcessFile {
    constructor(obj) {
        this.id = null;
        this.processId = obj.processId || null;
        this.name = obj.name;
        this.type = obj.type;
        this.encoding = obj.encoding;
        this.data = obj.data;
        this.decoded = undefined;
    }
    toString() {
        return `ProcessFile #${this.id} ${this.name}`;
    }
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON() {
        return {
            processId: this.processId,
            name: this.name,
            type: this.type,
            encoding: this.encoding,
            data: this.data
        };
    }
    /**
     * Save the file to the database.
     */
    async save(db) {
        const out = this.toJSON();
        if (this.encoding === 'json') {
            out.data = JSON.stringify(out.data);
        }
        if (this.id) {
            await db('process_files').update(out).where({ id: this.id });
            return this.id;
        }
        else {
            this.id = (await db('process_files').insert(out).returning('id'))[0];
            if (this.id)
                return this.id;
            throw new __1.DatabaseError(`Saving process ${JSON.stringify(out)} failed.`);
        }
    }
    /**
     * Check if the first line of the text file matches to the regular expression.
     * @param re
     */
    firstLineMatch(re) {
        const str = this.decode();
        const n = str.indexOf('\n');
        const line1 = n < 0 ? str : str.substr(0, n).trim();
        return re.test(line1);
    }
    /**
     * Find out if the content is binary or text.
     *
     * The mime type has to start with `text/`.
     */
    isTextFile() {
        var _a;
        return ((_a = this.type) === null || _a === void 0 ? void 0 : _a.startsWith('text/')) || false;
    }
    /**
     * Convert chardet encoding to the supported buffer encoding
     * "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
     */
    parseEncoding(encoding) {
        switch (encoding.toUpperCase()) {
            case 'UTF-8':
                return 'utf-8';
            case 'ISO-8859-1':
                return 'latin1';
            case 'UTF-16LE':
                return 'utf16le';
            default:
                throw new __1.InvalidFile(`Not able to map text encoding ${encoding}.`);
        }
    }
    /**
     * Try to recognize the file content and decode if it is a recognizable text format.
     */
    decode() {
        if (this.decoded) {
            return this.decoded;
        }
        switch (this.encoding) {
            case 'base64':
                const buffer = Buffer.from(this.data, 'base64');
                const encoding = chardet_1.default.detect(buffer);
                if (!encoding) {
                    throw new __1.InvalidFile(`Cannot determine encoding for '${this}'.`);
                }
                this.decoded = buffer.toString(this.parseEncoding(encoding));
                return this.decoded;
            default:
                throw new __1.InvalidFile(`An encoding '${this.encoding}' is not yet supported.`);
        }
    }
}
exports.ProcessFile = ProcessFile;
