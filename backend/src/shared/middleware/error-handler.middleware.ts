import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../errors/validation.error'
import { NotFoundError } from '../errors/not-found.error'

export const errorHandlerMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ValidationError) {
    res.status(422).json({ error: err.message })
    return
  }

  if (err instanceof NotFoundError || err.message === 'Employee not found') {
    res.status(404).json({ error: err.message })
    return
  }

  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
}
