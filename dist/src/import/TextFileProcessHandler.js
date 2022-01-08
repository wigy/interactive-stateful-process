"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFileProcessHandler = void 0;
const csv_parse_1 = __importDefault(require("csv-parse"));
const error_1 = require("../error");
const directions_1 = require("../directions");
const ProcessHandler_1 = require("../process/ProcessHandler");
const interactive_elements_1 = require("interactive-elements");
/**
 * Utility class to provide tools for implementing any text file based process handler.
 */
class TextFileProcessHandler extends ProcessHandler_1.ProcessHandler {
    /**
     * Split the file to lines and keep line numbers with the lines. Mark state type as initial state.
     * @param file
     * @returns
     */
    startingState(file) {
        return {
            stage: 'initial',
            files: {
                [file.name]: {
                    lines: file.decode().replace(/\n+$/, '').split('\n').map((text, line) => ({
                        text,
                        line,
                        columns: {}
                    }))
                }
            }
        };
    }
    /**
     * Check the state type is matching to 'complete'.
     * @param state
     */
    checkCompletion(state) {
        if (state.stage === 'executed') {
            return true;
        }
        return undefined;
    }
    /**
     * A hook to check alternative directions from initial state.
     * @param state
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async needInputForSegmentation(state, config) {
        return false;
    }
    /**
     * A hook to check alternative directions from segmented state.
     * @param state
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async needInputForClassification(state, config) {
        return false;
    }
    /**
     * A hook to check alternative directions from classified state.
     * @param state
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async needInputForAnalysis(state, config) {
        return false;
    }
    /**
     * A hook to check alternative directions from analyzed state.
     * @param state
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async needInputForExecution(state, config) {
        return false;
    }
    /**
     * Run steps in order 'segmentation', 'classification', 'analysis', 'execution'.
     * @param state
     * @returns
     */
    async getDirections(state, config) {
        let input;
        let directions;
        switch (state.stage) {
            case 'initial':
                input = await this.needInputForSegmentation(state, config);
                if (input)
                    return input;
                directions = new directions_1.Directions({
                    type: 'action',
                    action: { op: 'segmentation' }
                });
                break;
            case 'segmented':
                input = await this.needInputForClassification(state, config);
                if (input)
                    return input;
                directions = new directions_1.Directions({
                    type: 'action',
                    action: { op: 'classification' }
                });
                break;
            case 'classified':
                input = await this.needInputForAnalysis(state, config);
                if (input)
                    return input;
                directions = new directions_1.Directions({
                    type: 'action',
                    action: { op: 'analysis' }
                });
                break;
            case 'analyzed':
                input = await this.needInputForExecution(state, config);
                if (input)
                    return input;
                directions = new directions_1.Directions({
                    type: 'action',
                    action: { op: 'execution' }
                });
                break;
            default:
                throw new error_1.BadState('Cannot find directions from the current state.');
        }
        // TODO: Hmm. Something wrong with the structures here. This should not be forced.
        return directions;
    }
    /**
     * Call subclass implementation for each action.
     * @param action
     * @param state
     * @param files
     */
    async action(process, action, state, files) {
        if (!(0, interactive_elements_1.isImportAction)(action)) {
            throw new error_1.BadState(`Action is not import action ${JSON.stringify(action)}`);
        }
        if ((0, interactive_elements_1.isImportOpAction)(action)) {
            switch (action.op) {
                case 'analysis':
                case 'classification':
                case 'segmentation':
                case 'execution':
                    return this[action.op](process, state, files, process.config);
                default:
                    throw new error_1.BadState(`Cannot parse action ${JSON.stringify(action)}`);
            }
        }
        if ((0, interactive_elements_1.isImportConfigureAction)(action)) {
            Object.assign(process.config, action.configure);
            await process.save();
        }
        if ((0, interactive_elements_1.isImportAnswerAction)(action)) {
            if (!process.config.answers) {
                process.config.answers = {};
            }
            const answers = process.config.answers;
            for (const segmentId of Object.keys(action.answer)) {
                answers[segmentId] = answers[segmentId] || {};
                for (const variable of Object.keys(action.answer[segmentId])) {
                    answers[segmentId][variable] = action.answer[segmentId][variable];
                }
            }
            await process.save();
        }
        return state;
    }
    /**
     * This function must implement gathering of each line together that forms together one import activity.
     * @param state
     * @param files
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async segmentation(process, state, files, config) {
        throw new error_1.NotImplemented(`A class ${this.constructor.name} does not implement segmentation().`);
    }
    /**
     * This function must implement gathering of each line together that forms together one import activity.
     * @param state
     * @param files
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async classification(process, state, files, config) {
        throw new error_1.NotImplemented(`A class ${this.constructor.name} does not implement classification().`);
    }
    /**
     * This function must implement conversion from classified data to the actual executable operations.
     * @param state
     * @param files
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async analysis(process, state, files, config) {
        throw new error_1.NotImplemented(`A class ${this.constructor.name} does not implement analysis().`);
    }
    /**
     * This function must implement applying the result in practice.
     * @param state
     * @param files
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execution(process, state, files, config) {
        throw new error_1.NotImplemented(`A class ${this.constructor.name} does not implement execution().`);
    }
    /**
     * Go through each file and each line and add CSV interpretation of the content to each line.
     * @param state
     * @param options
     * @returns The original state that has been modified by adding CSV parsed field `columns`.
     */
    async parseCSV(state, options = {}) {
        // Helper to parse one line.
        const parseLine = async (line) => {
            return new Promise((resolve, reject) => {
                (0, csv_parse_1.default)(line, {
                    delimiter: options.columnSeparator || ','
                }, function (err, out) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(out[0]);
                    }
                });
            });
        };
        // Heading names per column.
        let headings = [];
        let dropLines = options.cutFromBeginning || 0;
        // Run loop over all files.
        let firstLine = true;
        for (const fileName of Object.keys(state.files)) {
            for (let n = 0; n < state.files[fileName].lines.length; n++) {
                if (dropLines) {
                    dropLines--;
                    continue;
                }
                const line = { ...state.files[fileName].lines[n] };
                const text = options.trimLines ? line.text.trim() : line.text;
                // Collect or define headings on the first line.
                if (firstLine) {
                    firstLine = false;
                    if (options.useFirstLineHeadings) {
                        headings = await parseLine(text);
                        continue;
                    }
                    else {
                        const size = (await parseLine(text)).length;
                        for (let i = 0; i < size; i++) {
                            headings.push(`${i}`);
                        }
                    }
                }
                // Map each column to its heading name.
                const columns = {};
                const pieces = text.trim() !== '' ? await parseLine(text) : null;
                if (pieces) {
                    pieces.forEach((column, index) => {
                        if (index < headings.length) {
                            columns[headings[index]] = column;
                        }
                        else {
                            columns['+'] = columns['+'] || '';
                            columns['+'] += column + '\n';
                        }
                    });
                    line.columns = columns;
                    // Add it back with columns.
                    state.files[fileName].lines[n] = line;
                }
            }
        }
        const newState = {
            ...state,
            stage: 'segmented'
        };
        return newState;
    }
}
exports.TextFileProcessHandler = TextFileProcessHandler;
//# sourceMappingURL=TextFileProcessHandler.js.map