import express from 'express'
import { Server } from 'http'
import Knex from 'knex'
import cors from 'cors'
import { router } from '../src/server/router'
import { ProcessingSystem } from '../src'
import { DemoElement } from './element'
import { DemoState } from './state'
import { DemoAction } from './action'

/**
 * Configuration.
 */
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3302
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'

/**
 * Simple demo server.
 */
class ISPDemoServer {
  private app = express()
  private server: Server

  public start = async () => {

    const db = Knex(DATABASE_URL)
    await db.migrate.rollback() // If you don't want reset between restarts, remove this.
    await db.migrate.latest()

    function configurator() {
      const system = new ProcessingSystem<DemoElement, DemoState, DemoAction>(db)
      // TODO: Register demo handlers.
      return system
    }

    this.app.use((req, res, next) => { console.log(new Date(), req.method, req.url); next() })
    this.app.use(cors('*'))
    this.app.use(express.json({ limit: '1024MB' }))
    this.app.use('/api/isp', router(db, configurator))

    this.server = this.app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}.`)
    })

    this.server.on('error', (msg) => {
      console.error(msg)
    })
  }
}

/**
 * Launch the server.
 */
(async () => {
  const server = new ISPDemoServer()
  server.start()
})()
