import { Router } from 'express'
import { InsightsService } from './insights.service'
import { InsightsController } from './insights.controller'

export const createInsightsRouter = (service: InsightsService): Router => {
  const router = Router()
  const controller = new InsightsController(service)

  router.get('/country/:country', controller.getCountryStats)
  router.get('/job-title', controller.getJobTitleStats)
  router.get('/top-earners', controller.getTopEarners)

  return router
}
