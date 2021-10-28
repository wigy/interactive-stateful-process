"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConnector = void 0;
const __1 = require("..");
exports.defaultConnector = {
    async initialize() {
        console.log(new Date(), 'Connector initialized.');
    },
    async getConfig() {
        throw new __1.SystemError('Cannot use processing system configuration, since it is not defined.');
    },
    async applyResult() {
        console.log(new Date(), 'Result received.');
    },
    async success() {
        console.log(new Date(), 'Process completed.');
    }
};
