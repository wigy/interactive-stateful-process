"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConnector = void 0;
exports.defaultConnector = {
    async initialize() {
        console.log(new Date(), 'Connector initialized.');
    },
    async applyResult() {
        console.log(new Date(), 'Result received.');
    },
    async success() {
        console.log(new Date(), 'Process completed.');
    },
    async waiting() {
        console.log(new Date(), 'Process waiting.');
    },
    async fail() {
        console.error(new Date(), 'Process failed.');
    },
    async getTranslation(text) {
        return text;
    }
};
