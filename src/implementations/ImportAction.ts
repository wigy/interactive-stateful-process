/**
 * Actions for changing the import phases.
 */
export interface ImportAction {
  op: 'segmentation' | 'classification' | 'analysis' | 'execution'
}
export function isImportAction(obj: unknown): obj is ImportAction {
  if (typeof obj === 'object' && obj !== null) {
    if ('op' in obj) {
      return ['segmentation', 'classification', 'analysis', 'execution'].includes((obj as { op: string}).op)
    }
  }
  return false
}
