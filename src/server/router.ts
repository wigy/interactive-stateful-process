import express, { Router } from 'express'
import { ProcessingConfigurator } from '.'
import { Database } from '..'
import apiCreator from './api'

export function router<VendorElement, VendorState, VendorAction>(db: Database, configurator: ProcessingConfigurator<VendorElement, VendorState, VendorAction>): Router {
  const router = express.Router()
  const api = apiCreator(db)

  // TODO: Configure the processing system into res.locals.
  // Or possibly with some hook router({ config: (req: Request) => ProcessingSystem })
  router.get('/',
    async (req, res) => {
      // TODO: List of processes.
      return res.status(200).send([])
    })

  router.post('/',
    async (req, res) => {
      const system = configurator(req)
      const { files } = req.body
      // TODO: Multifile support.
      const process = await system.createProcess(`Uploading ${files[0].mimeType} file ${files[0].name}`, files[0])
      if (process.canRun()) {
        await process.run()
      }
      return res.send(await api.process.get(process.id))
    })

  return router
}
