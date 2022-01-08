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
                const data = await db('processes').select('*').where({ id }).first();
                if (data) {
                    const steps = await db('process_steps').select('id', 'action', 'directions', 'number', 'started', 'finished').where({ processId: id }).orderBy('number');
                    data.steps = steps ? steps : [];
                }
                return data;
            },
            getStep: async (id, number) => {
                const data = await db('process_steps').select('*').where({ processId: id, number }).first();
                return data;
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=api.js.map