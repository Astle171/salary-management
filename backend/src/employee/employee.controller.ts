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

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.create(req.body)
      res.status(201).json(employee)
    } catch (err) {
      next(err)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.getById(req.params.id as string)
      res.json(employee)
    } catch (err) {
      next(err)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.update(req.params.id as string, req.body)
      res.json(employee)
    } catch (err) {
      next(err)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }
}
