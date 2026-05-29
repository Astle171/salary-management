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
}
