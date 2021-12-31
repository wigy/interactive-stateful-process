"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.num = void 0;
/**
 * Utility to heuristically convert nessy string to number.
 * @param str
 * @returns
 */
function num(str) {
    str = str.replace(/\s/g, '');
    try {
        if (/,\d+\./.test(str)) {
            str = str.replace(/,/g, '');
        }
        else if (/\.\d+,/.test(str)) {
            str = str.replace(/\./g, '').replace(/,/, '.');
        }
        else {
            str = str.replace(',', '.');
        }
        return parseFloat(str);
    }
    catch (err) {
        return NaN;
    }
}
exports.num = num;
