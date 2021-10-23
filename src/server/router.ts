import express, { Router } from 'express'

export function router(): Router {
  const router = express.Router()

  router.get('/',
  async (req, res) => {
    return res.status(200).send([])
  })

  return router
}
