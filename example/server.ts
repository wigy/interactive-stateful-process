import express from 'express'
import { Server } from 'http'
import Knex from 'knex'
import { router } from '../src/server/router'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3302
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost/test'

class ISPDemoServer {
  private app = express()
  private server: Server

  public start = async () => {

    const db = Knex(DATABASE_URL)
    await db.migrate.latest()

    this.app.use(express.json())
    this.app.use('/api/isp', router())

    this.server = this.app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}.`)
    })

    this.server.on('error', (msg) => {
      console.error(msg)
    })
  }
}

(async () => {
  const server = new ISPDemoServer()
  server.start()
})()
