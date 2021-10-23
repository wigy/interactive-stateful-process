import { DemoElement } from './element'
import { DemoState } from './state'
import { DemoAction } from './action'
import { ISPDemoServer } from '../src/server/ISPDemoServer'

/**
 * Launch the demo server.
 */
(async () => {
  const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3302
  const DATABASE_URL: string = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'
  const server = new ISPDemoServer<DemoElement, DemoState, DemoAction>(PORT, DATABASE_URL)
  server.start()
})()
