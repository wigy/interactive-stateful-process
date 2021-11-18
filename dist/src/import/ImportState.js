"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImportState = void 0;
function isImportState(obj) {
    if (typeof obj !== 'object') {
        return false;
    }
    if (obj === null) {
        return false;
    }
    if (!('stage' in obj) || !('files' in obj)) {
        return false;
    }
    if (typeof obj['stage'] !== 'string') {
        return false;
    }
    if (!['initial', 'segmented', 'classified', 'analyzed', 'executed'].includes(obj['stage'])) {
        return false;
    }
    return true;
}
exports.isImportState = isImportState;
