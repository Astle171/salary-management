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
}
