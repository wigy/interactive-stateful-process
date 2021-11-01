"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImportAction = void 0;
function isImportAction(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if ('op' in obj) {
            return ['segmentation', 'classification', 'analysis', 'execution'].includes(obj.op);
        }
    }
    return false;
}
exports.isImportAction = isImportAction;
