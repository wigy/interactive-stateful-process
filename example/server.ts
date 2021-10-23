import express from 'express'
import { Server } from 'http'
import { router } from '../src/server/router'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3302

class ISPDemoServer {
  public app = express()
  private server: Server

  public start = async () => {

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
