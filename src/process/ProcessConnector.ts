/**
 * A connector interface for fetching configuration values and sometimes for applying results.
 */
 export interface ProcessConnector {
  initialize(server: unknown): Promise<void>
  getConfig(section: string, name: string): Promise<unknown>
  applyResult(args: unknown): Promise<void>
}
