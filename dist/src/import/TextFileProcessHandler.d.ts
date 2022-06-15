import { Directions } from '..';
import { ProcessFile } from '../process/ProcessFile';
import { ProcessHandler } from '../process/ProcessHandler';
import { ImportAction, InteractiveElement, ProcessConfig } from 'interactive-elements';
import { ImportCSVOptions } from 'interactive-elements';
import { ImportState, ImportStateText } from 'interactive-elements';
import { Process } from '../process/Process';
/**
 * Utility class to provide tools for implementing any text file based process handler.
 */
export declare class TextFileProcessHandler<VendorElement extends InteractiveElement> extends ProcessHandler<VendorElement, ImportState, ImportAction> {
    /**
     * Split the file to lines and keep line numbers with the lines. Mark state type as initial state.
     * @param file
     * @returns
     */
    startingState(file: ProcessFile): ImportStateText<'initial'>;
    /**
     * Check the state type is matching to 'complete'.
     * @param state
     */
    checkCompletion(state: ImportState): boolean | undefined;
    /**
     * A hook to check alternative directions from initial state.
     * @param state
     * @returns
     */
    needInputForSegmentation(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false>;
    /**
     * A hook to check alternative directions from segmented state.
     * @param state
     * @returns
     */
    needInputForClassification(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false>;
    /**
     * A hook to check alternative directions from classified state.
     * @param state
     * @returns
     */
    needInputForAnalysis(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false>;
    /**
     * A hook to check alternative directions from analyzed state.
     * @param state
     * @returns
     */
    needInputForExecution(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false>;
    /**
     * Run steps in order 'segmentation', 'classification', 'analysis', 'execution'.
     * @param state
     * @returns
     */
    getDirections(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction>>;
    /**
     * Call subclass implementation for each action.
     * @param action
     * @param state
     * @param files
     */
    action(process: Process<VendorElement, ImportState, ImportAction>, action: ImportAction, state: ImportState, files: ProcessFile[]): Promise<ImportState>;
    /**
     * This function must implement gathering of each line together that forms together one import activity.
     * @param state
     * @param files
     */
    segmentation(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState>;
    /**
     * This function must implement gathering of each line together that forms together one import activity.
     * @param state
     * @param files
     */
    classification(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState>;
    /**
     * This function must implement conversion from classified data to the actual executable operations.
     * @param state
     * @param files
     */
    analysis(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState>;
    /**
     * This function must implement applying the result in practice.
     * @param state
     * @param files
     */
    execution(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState>;
    /**
     * Parse a single line of CSV.
     * @param line
     * @param options
     * @returns
     */
    parseLine(line: string, options?: ImportCSVOptions): Promise<string[]>;
    /**
     * Go through each file and each line and add CSV interpretation of the content to each line.
     * @param state
     * @param options
     * @returns The original state that has been modified by adding CSV parsed field `columns`.
     */
    parseCSV(state: ImportStateText<'initial'>, options?: ImportCSVOptions): Promise<ImportStateText<'segmented'>>;
}
