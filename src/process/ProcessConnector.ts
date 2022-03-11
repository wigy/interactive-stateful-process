import { ID } from "interactive-elements"

/**
 * A connector interface for querying information, applying results and running various hooks.
 */
 export interface ProcessConnector {
  initialize(server: unknown): Promise<void>
  getTranslation(text: string, language: string): Promise<string>
  applyResult(processId: ID, args: unknown): Promise<Record<string, unknown> | undefined>
  success(state: unknown): Promise<void>
  waiting(state: unknown, directions): Promise<void>
  fail(state: unknown): Promise<void>
}

export const defaultConnector = {
  async initialize(): Promise<void> {
    console.log(new Date(), 'Connector initialized.')
  },
  async applyResult(): Promise<void> {
    console.log(new Date(), 'Result received.')
  },
  async success(): Promise<void> {
    console.log(new Date(), 'Process completed.')
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async waiting(): Promise<void> {
  },
  async fail(): Promise<void> {
    console.error(new Date(), 'Process failed.')
  },
  async getTranslation(text: string) {
    return text
  }
}
