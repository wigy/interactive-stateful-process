import express, { Router } from 'express'
import { ProcessingConfigurator } from '.'

export function router<VendorElement, VendorState, VendorAction>(configurator: ProcessingConfigurator<VendorElement, VendorState, VendorAction>): Router {
  const router = express.Router()

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
      // Launch the process.
      return res.status(200).send([])
    })

  return router
}
