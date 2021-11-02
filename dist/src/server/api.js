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
            getAll: async () => {
                return db('processes').select('*').orderBy('created', 'desc');
            },
            get: async (id) => {
                return db('processes').select('*').where({ id }).first();
            }
        }
    };
}
exports.default = default_1;
