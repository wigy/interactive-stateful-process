import express, { Router } from 'express'
import { ProcessingConfigurator } from '.'
import { Database } from '..'
import apiCreator from './api'

export function router<VendorElement, VendorState, VendorAction>(db: Database, configurator: ProcessingConfigurator<VendorElement, VendorState, VendorAction>): Router {

  const router = express.Router()
  const api = apiCreator(db)

  router.get('/',
    async (req, res) => {
      return res.send(await api.process.getAll())
    })

  router.get('/:id',
  async (req, res) => {
    return res.send(await api.process.get(parseInt(req.params.id)))
  })

  router.post('/',
    async (req, res) => {
      const system = configurator(req)
      const { files, config } = req.body
      // TODO: Multifile support. One process per file? Or offer all to system which creates one or more processes.
      // Additional files could be offered to the existing processes created first before creating additional process.
      const process = await system.createProcess(`Uploading ${files[0].type} file ${files[0].name}`, files[0], config)
      if (process.canRun()) {
        await process.run()
      }
      return res.send(await api.process.get(process.id))
    })

  return router
}
