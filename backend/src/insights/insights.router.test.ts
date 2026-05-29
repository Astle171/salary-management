import request from 'supertest'
import express from 'express'
import { createApp } from '../app'
import { InsightsService } from './insights.service'
import { InMemoryInsightsRepository } from './repository/in-memory-insights.repository'
import { Employee } from '../shared/types/employee.types'

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: Math.random().toString(),
  full_name: 'Test User',
  job_title: 'Engineer',
  department: 'Engineering',
  country: 'India',
  salary: 60000,
  currency: 'USD',
  employment_type: 'full_time',
  hire_date: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})

describe('Insights Routes', () => {
  let insightsRepo: InMemoryInsightsRepository
  let app: express.Express

  beforeEach(() => {
    insightsRepo = new InMemoryInsightsRepository()
    const insightsService = new InsightsService(insightsRepo)
    app = createApp({ insightsService })
  })

  describe('GET /api/insights/country/:country', () => {
    it('should return 200 with salary stats for a country', async () => {
      insightsRepo.seedEmployees([
        makeEmployee({ country: 'India', salary: 40000 }),
        makeEmployee({ country: 'India', salary: 80000 }),
      ])

      const res = await request(app).get('/api/insights/country/India')

      expect(res.status).toBe(200)
      expect(res.body.country).toBe('India')
      expect(res.body.min_salary).toBe(40000)
      expect(res.body.max_salary).toBe(80000)
      expect(res.body.avg_salary).toBe(60000)
      expect(res.body.employee_count).toBe(2)
    })

    it('should return 404 when country has no employees', async () => {
      const res = await request(app).get('/api/insights/country/Antarctica')

      expect(res.status).toBe(404)
    })
  })
})
