import { SystemError } from ".."

/**
 * A connector interface for fetching configuration values and sometimes for applying results.
 */
 export interface ProcessConnector {
  initialize(server: unknown): Promise<void>
  getConfig(section: string, name: string): Promise<unknown>
  applyResult(args: unknown): Promise<void>
  success(state: unknown): Promise<void>
}

export const defaultConnector = {
  async initialize(): Promise<void> {
    console.log(new Date(), 'Connector initialized.')
  },
  async getConfig(): Promise<unknown> {
    throw new SystemError('Cannot use processing system configuration, since it is not defined.')
  },
  async applyResult(): Promise<void> {
    console.log(new Date(), 'Result received.')
  },
  async success(): Promise<void> {
    console.log(new Date(), 'Process completed.')
  }
}
