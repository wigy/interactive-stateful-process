import express from 'express'
import { Server } from 'http'
import Knex from 'knex'
import cors from 'cors'
import { router } from './router'
import { Database, ProcessConnector, ProcessHandler, ProcessingSystem } from '..'

/**
 * Simple demo server.
 */
export class ISPDemoServer<DemoElement, DemoState, DemoAction> {
  private app = express()
  private server: Server
  private port: number
  private db: Database
  private handlers: ProcessHandler<DemoElement, DemoState, DemoAction>[]
  private configurator: ProcessConnector

  constructor(port: number, databaseUrl: string, handlers: ProcessHandler<DemoElement, DemoState, DemoAction>[], configurator: ProcessConnector|null = null) {
    this.port = port
    this.db = Knex(databaseUrl)
    this.handlers = handlers
    if (configurator) this.configurator = configurator
  }

  public start = async (): Promise<void> => {

    await this.db.migrate.rollback() // If you don't want reset between restarts, remove this.
    await this.db.migrate.latest()

    const systemCreator = () => {
      const system = new ProcessingSystem<DemoElement, DemoState, DemoAction>(this.db)
      this.handlers.forEach(handler => system.register(handler))
      if (this.configurator) {
        system.configurator = this.configurator
      }
      return system
    }

    this.app.use((req, res, next) => { console.log(new Date(), req.method, req.url); next() })
    this.app.use(cors('*'))
    this.app.use(express.json({ limit: '1024MB' }))
    this.app.use('/api/isp', router(this.db, systemCreator))

    this.server = this.app.listen(this.port, () => {
      console.log(`Server started on port ${this.port}.`)
    })

    this.server.on('error', (msg) => {
      console.error(msg)
    })
  }
}
