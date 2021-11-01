/**
 * Actions for changing the import phases.
 */
export interface ImportAction {
    op: 'segmentation' | 'classification' | 'analysis' | 'execution';
}
export declare function isImportAction(obj: unknown): obj is ImportAction;
