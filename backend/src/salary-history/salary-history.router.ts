import { Router, Request, Response, NextFunction } from 'express'
import { SalaryHistoryService } from './salary-history.service'
import { validateQuery } from '../shared/middleware/validate-request.middleware'
import { GetSalaryAtDateQuerySchema } from './salary-history.schemas'

export const createSalaryHistoryRouter = (service: SalaryHistoryService): Router => {
  const router = Router()

  router.get('/:id/salary', validateQuery(GetSalaryAtDateQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query as unknown as { date: Date }
      const record = await service.getSalaryAtDate(req.params.id as string, date)
      res.json(record)
    } catch (err) {
      next(err)
    }
  })

  return router
}
