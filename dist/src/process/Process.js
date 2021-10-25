"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process = void 0;
const clone_1 = __importDefault(require("clone"));
const __1 = require("..");
const ProcessFile_1 = require("./ProcessFile");
const ProcessStep_1 = require("./ProcessStep");
/**
 * A complete description of the process state and steps taken.
 */
class Process {
    constructor(system, name) {
        this.system = system;
        this.id = null;
        this.name = name || '[no name]';
        this.complete = false;
        this.successful = undefined;
        this.files = [];
        this.steps = [];
        this.currentStep = undefined;
        this.status = __1.ProcessStatus.INCOMPLETE;
    }
    toString() {
        return `Process #${this.id} ${this.name}`;
    }
    /**
     * Get the loaded process information as JSON object.
     * @returns
     */
    toJSON() {
        return {
            name: this.name,
            complete: this.complete,
            successful: this.successful,
            currentStep: this.currentStep,
            status: this.status,
            error: this.error
        };
    }
    /**
     * Append a file to this process and link its ID.
     * @param file
     */
    addFile(file) {
        file.processId = this.id;
        this.files.push(file);
    }
    /**
     * Append a step to this process and link its ID.
     * @param step
     */
    async addStep(step) {
        step.processId = this.id;
        step.process = this;
        this.steps.push(step);
    }
    /**
     * Load the current step if necessary and return it.
     */
    async getCurrentStep() {
        if (this.currentStep === null || this.currentStep === undefined) {
            throw new __1.BadState(`Process #${this.id} ${this.name} has invalid current step.`);
        }
        if (this.steps[this.currentStep]) {
            return this.steps[this.currentStep];
        }
        return this.loadStep(this.currentStep);
    }
    /**
     * Mark the current state as completed and create new additional step with the new state.
     * @param state
     */
    async proceedToState(action, state) {
        const current = await this.getCurrentStep();
        const handler = this.system.getHandler(current.handler);
        current.action = action;
        current.finished = new Date();
        current.save();
        const nextStep = new ProcessStep_1.ProcessStep({
            number: current.number + 1,
            state,
            handler: handler.name
        });
        this.addStep(nextStep);
        this.currentStep = (this.currentStep || 0) + 1;
        this.system.logger.info(`Proceeding ${this} to new step ${this.currentStep}.`);
        this.save();
        await nextStep.save();
        await this.system.checkFinishAndFindDirections(handler, nextStep);
    }
    /**
     * Get a reference to the database.
     */
    get db() {
        return this.system.db;
    }
    /**
     * Save the process info to the database.
     */
    async save() {
        if (this.id) {
            await this.db('processes').update(this.toJSON()).where({ id: this.id });
            return this.id;
        }
        else {
            this.id = (await this.db('processes').insert(this.toJSON()).returning('id'))[0];
            if (this.id)
                return this.id;
            throw new __1.DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
        }
    }
    /**
     * Load the process data and its files. Note that current step is not yet loaded here, but when using getCurrentStep().
     * @param id
     */
    async load(id) {
        // Load basic info.
        const data = await this.db('processes').select('*').where({ id }).first();
        if (!data) {
            throw new __1.InvalidArgument(`Cannot find process #${id}`);
        }
        Object.assign(this, data);
        this.id = id;
        // Load files.
        this.files = (await this.db('process_files').select('*').where({ processId: this.id })).map(fileData => {
            const file = new ProcessFile_1.ProcessFile(fileData);
            file.id = fileData.id;
            return file;
        });
        // Load current step.
        await this.getCurrentStep();
    }
    /**
     * Load the step with the given number from the database.
     * @param number
     * @returns
     */
    async loadStep(number) {
        if (!this.id) {
            throw new __1.BadState(`Cannot load steps, if the process have no ID ${JSON.stringify(this.toJSON())}.`);
        }
        if (this.currentStep === undefined) {
            throw new __1.BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`);
        }
        const data = await this.db('process_steps').where({ processId: this.id, number }).first();
        if (!data) {
            throw new __1.BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`);
        }
        this.steps[this.currentStep] = new ProcessStep_1.ProcessStep(data);
        this.steps[this.currentStep].process = this;
        return this.steps[this.currentStep];
    }
    /**
     * Check if the process can be run.
     */
    canRun() {
        return !this.complete && (this.status === __1.ProcessStatus.INCOMPLETE || this.status === __1.ProcessStatus.WAITING);
    }
    /**
     * Execute process as long as it is completed, failed or requires additional input.
     */
    async run() {
        let step;
        let MAX_RUNS = 100;
        while (true) {
            MAX_RUNS--;
            if (MAX_RUNS < 0) {
                this.system.logger.error(`Maximum number of executions reached for the process ${this}.`);
                break;
            }
            step = await this.getCurrentStep();
            if (!step.directions) {
                break;
            }
            if (!step.directions.isImmediate()) {
                await this.updateStatus();
                break;
            }
            const handler = this.system.getHandler(step.handler);
            const state = (0, clone_1.default)(step.state);
            const action = (0, clone_1.default)(step.directions.action);
            try {
                if (action) {
                    const nextState = await handler.action(action, state, this.files);
                    await this.proceedToState(action, nextState);
                }
                else {
                    throw new __1.BadState(`Process step ${step} has no action.`);
                }
            }
            catch (err) {
                this.system.logger.error(err);
                return this.crashed(err);
            }
        }
    }
    /**
     * Record the error and mark the process as finished with an error.
     * @param err
     */
    async crashed(err) {
        this.system.logger.error(`Processing of ${this} failed:`, err);
        if (this.currentStep !== undefined && this.currentStep !== null) {
            const step = await this.loadStep(this.currentStep);
            step.finished = new Date();
            await step.save();
        }
        this.error = err.stack ? err.stack : `${err.name}: ${err.message}`;
        await this.save();
        await this.updateStatus();
    }
    /**
     * Resolve the status of the process and update it to the database.
     */
    async updateStatus() {
        let status = __1.ProcessStatus.INCOMPLETE;
        if (this.error) {
            status = __1.ProcessStatus.CRASHED;
        }
        else {
            if (this.currentStep === null || this.currentStep === undefined) {
                throw new __1.BadState(`Cannot check status when there is no current step loaded for ${this}`);
            }
            const step = this.steps[this.currentStep];
            if (step.finished) {
                if (this.successful === true)
                    status = __1.ProcessStatus.SUCCEEDED;
                if (this.successful === false)
                    status = __1.ProcessStatus.FAILED;
            }
            if (step.directions) {
                status = step.directions.isImmediate() ? __1.ProcessStatus.INCOMPLETE : __1.ProcessStatus.WAITING;
            }
        }
        if (this.status !== status) {
            this.system.logger.info(`Process ${this} is now ${status}`);
        }
        this.status = status;
        await this.db('processes').update({ status }).where({ id: this.id });
    }
    /**
     * Get the state of the current step of the process.
     */
    get state() {
        if (this.currentStep === null || this.currentStep === undefined) {
            throw new __1.BadState(`Cannot check state when there is no current step loaded for ${this}`);
        }
        const step = this.steps[this.currentStep];
        return step.state;
    }
    /**
     * Handle external input coming ing.
     * @param action
     */
    async input(action) {
        const step = await this.getCurrentStep();
        const handler = this.system.getHandler(step.handler);
        let nextState;
        try {
            nextState = await handler.action(action, (0, clone_1.default)(step.state), this.files);
        }
        catch (err) {
            return this.crashed(err);
        }
        await this.proceedToState(action, nextState);
    }
    /**
     * Roll back the latest step.
     */
    async rollback() {
        if (this.currentStep === null || this.currentStep === undefined) {
            throw new __1.BadState(`Cannot roll back when there is no current step.`);
        }
        if (this.currentStep < 1) {
            throw new __1.BadState(`Cannot roll back when there is only initial step in the process.`);
        }
        const step = await this.getCurrentStep();
        this.system.logger.info(`Attempt of rolling back '${step}' from '${this}'.`);
        const handler = this.system.getHandler(step.handler);
        const result = await handler.rollback(step);
        if (result) {
            if (this.error) {
                this.error = undefined;
            }
            await this.db('process_steps').delete().where({ id: step.id });
            this.currentStep--;
            await this.save();
            const newCurrentStep = await this.getCurrentStep();
            newCurrentStep.finished = undefined;
            await newCurrentStep.save();
            await this.updateStatus();
            this.system.logger.info(`Roll back of '${this}' to '${newCurrentStep}' successful.`);
            return true;
        }
        this.system.logger.info(`Not able to roll back '${this}'.`);
        return false;
    }
}
exports.Process = Process;
