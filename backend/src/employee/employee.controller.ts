import { Request, Response, NextFunction } from 'express'
import { EmployeeService } from './employee.service'

export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options = {
        page:      req.query.page      ? Number(req.query.page)  : undefined,
        limit:     req.query.limit     ? Number(req.query.limit) : undefined,
        country:   req.query.country   as string | undefined,
        job_title: req.query.job_title as string | undefined,
        search:    req.query.search    as string | undefined,
      }
      const result = await this.service.list(options)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
