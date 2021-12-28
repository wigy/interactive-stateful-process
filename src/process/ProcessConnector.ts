import { ID } from "interactive-elements"

/**
 * A connector interface for querying information, applying results and running various hooks.
 */
 export interface ProcessConnector {
  initialize(server: unknown): Promise<void>
  getTranslation(text: string, language: string): Promise<string>
  applyResult(processId: ID, args: unknown): Promise<void>
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
  async waiting(): Promise<void> {
    console.log(new Date(), 'Process waiting.')
  },
  async fail(): Promise<void> {
    console.error(new Date(), 'Process failed.')
  },
  async getTranslation(text: string) {
    return text
  }
}
