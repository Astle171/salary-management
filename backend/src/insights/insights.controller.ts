import { Request, Response, NextFunction } from 'express'
import { InsightsService } from './insights.service'

export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  getCountryStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getCountryStats(req.params.country as string)
      if (!stats) {
        res.status(404).json({ error: `No employees found for country: ${req.params.country}` })
        return
      }
      res.json(stats)
    } catch (err) {
      next(err)
    }
  }

  getJobTitleStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, country } = req.query as { title?: string; country?: string }

      if (!title || !country) {
        res.status(422).json({ error: 'title and country query params are required' })
        return
      }

      const stats = await this.service.getJobTitleStats(title, country)
      if (!stats) {
        res.status(404).json({ error: `No data found for ${title} in ${country}` })
        return
      }
      res.json(stats)
    } catch (err) {
      next(err)
    }
  }

  getTopEarners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10
      const country = req.query.country as string | undefined
      const earners = await this.service.getTopEarners(limit, country)
      res.json(earners)
    } catch (err) {
      next(err)
    }
  }

  getDepartmentDistribution = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const country = req.query.country as string | undefined
      const distribution = await this.service.getDepartmentDistribution(country)
      res.json(distribution)
    } catch (err) {
      next(err)
    }
  }
}
