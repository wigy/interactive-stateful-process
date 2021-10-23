import express, { Router } from 'express'

export function router(): Router {
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
      // Launch the process.
      return res.status(200).send([])
    })

  return router
}
