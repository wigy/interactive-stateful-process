"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStep = void 0;
const __1 = require("..");
/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
class ProcessStep {
    constructor(obj) {
        this.processId = obj.processId || null;
        this.number = obj.number;
        this.state = obj.state;
        this.handler = obj.handler;
        this.directions = obj.directions ? new __1.Directions(obj.directions) : undefined;
        this.action = obj.action;
        this.started = obj.started;
        this.finished = obj.finished;
    }
    toString() {
        return `ProcessStep ${this.number} of Process #${this.processId}`;
    }
    /**
     * Get a reference to the database.
     */
    get db() {
        return this.process.db;
    }
    /**
     * Save the process info to the database.
     */
    async save() {
        if (this.id) {
            await this.db('process_steps').update(this.toJSON()).where({ id: this.id });
            return this.id;
        }
        else {
            this.started = new Date();
            this.id = (await this.db('process_steps').insert(this.toJSON()).returning('id'))[0];
            if (this.id)
                return this.id;
            throw new __1.DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
        }
    }
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON() {
        return {
            processId: this.processId,
            number: this.number,
            state: this.state,
            directions: this.directions,
            handler: this.handler,
            action: this.action,
            started: this.started,
            finished: this.finished,
        };
    }
    /**
     * Set directions and update database.
     * @param db
     * @param directions
     */
    async setDirections(db, directions) {
        this.directions = directions;
        await db('process_steps').update({ directions: directions.toJSON() }).where({ id: this.id });
    }
}
exports.ProcessStep = ProcessStep;
