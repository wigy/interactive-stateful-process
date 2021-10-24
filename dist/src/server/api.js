"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Data query API for processes.
 * @param db
 * @returns
 */
function default_1(db) {
    return {
        process: {
            get: async (id = null) => {
                if (id) {
                    return db('processes').select('*').where({ id }).first();
                }
                return db('processes').select('*');
            }
        }
    };
}
exports.default = default_1;
