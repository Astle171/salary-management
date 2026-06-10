import request from 'supertest'
import express from 'express'
import { createSalaryHistoryRouter } from './salary-history.router'
import { SalaryHistoryService } from './salary-history.service'
import { InMemorySalaryHistoryRepository } from './repository/in-memory-salary-history.repository'
import { errorHandlerMiddleware } from '../shared/middleware/error-handler.middleware'

const buildApp = () => {
  const repo = new InMemorySalaryHistoryRepository()
  const service = new SalaryHistoryService(repo)
  const app = express()
  app.use(express.json())
  app.use('/api/employees', createSalaryHistoryRouter(service))
  app.use(errorHandlerMiddleware)
  return { app, repo }
}

describe('GET /api/employees/:id/salary', () => {
  it('returns 200 with the active salary record for the given date', async () => {
    const { app, repo } = buildApp()
    await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-01-01') })

    const res = await request(app).get('/api/employees/emp-1/salary?date=2024-06-01')

    expect(res.status).toBe(200)
    expect(res.body.salary).toBe(80000)
    expect(res.body.employee_id).toBe('emp-1')
  })

  it('returns 404 when no salary record exists on or before the given date', async () => {
    const { app } = buildApp()

    const res = await request(app).get('/api/employees/emp-1/salary?date=2024-01-01')

    expect(res.status).toBe(404)
  })

  it('returns 422 when date query param is missing', async () => {
    const { app } = buildApp()

    const res = await request(app).get('/api/employees/emp-1/salary')

    expect(res.status).toBe(422)
  })

  it('returns 422 when date is not a valid date string', async () => {
    const { app } = buildApp()

    const res = await request(app).get('/api/employees/emp-1/salary?date=not-a-date')

    expect(res.status).toBe(422)
  })
})
