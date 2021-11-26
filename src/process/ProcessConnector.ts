import { SystemError } from ".."

export type ProcessConfigSection = 'settings' | 'translations' | 'handler'

/**
 * A connector interface for fetching configuration values and sometimes for applying results.
 */
 export interface ProcessConnector {
  initialize(server: unknown): Promise<void>
  getConfig(section: ProcessConfigSection, name: string): Promise<unknown>
  getTranslation(text: string, language: string): Promise<string>
  applyResult(args: unknown): Promise<void>
  success(state: unknown): Promise<void>
}

export const defaultConnector = {
  async initialize(): Promise<void> {
    console.log(new Date(), 'Connector initialized.')
  },
  async getConfig(section: ProcessConfigSection, name: string): Promise<unknown> {
    throw new SystemError(`Cannot use processing system configuration to fetch ${section}.${name}, since it is not defined.`)
  },
  async applyResult(): Promise<void> {
    console.log(new Date(), 'Result received.')
  },
  async success(): Promise<void> {
    console.log(new Date(), 'Process completed.')
  },
  async getTranslation(text: string) {
    return text
  }
}
