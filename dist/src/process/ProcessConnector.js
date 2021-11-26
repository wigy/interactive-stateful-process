"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConnector = void 0;
const __1 = require("..");
exports.defaultConnector = {
    async initialize() {
        console.log(new Date(), 'Connector initialized.');
    },
    async getConfig(section, name) {
        throw new __1.SystemError(`Cannot use processing system configuration to fetch ${section}.${name}, since it is not defined.`);
    },
    async applyResult() {
        console.log(new Date(), 'Result received.');
    },
    async success() {
        console.log(new Date(), 'Process completed.');
    },
    async getTranslation(text) {
        return text;
    }
};
