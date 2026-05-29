import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validateBody = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'Validation failed',
          details: err.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
        return
      }
      next(err)
    }
  }

export const validateQuery = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query)
      Object.defineProperty(req, 'query', {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true
      })
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'Validation failed',
          details: err.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
        return
      }
      next(err)
    }
  }
