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

  describe('GET /api/insights/job-title', () => {
    it('should return avg salary for job title in a country', async () => {
      insightsRepo.seedEmployees([
        makeEmployee({ job_title: 'Engineer', country: 'India', salary: 50000 }),
        makeEmployee({ job_title: 'Engineer', country: 'India', salary: 70000 }),
      ])

      const res = await request(app)
        .get('/api/insights/job-title')
        .query({ title: 'Engineer', country: 'India' })

      expect(res.status).toBe(200)
      expect(res.body.avg_salary).toBe(60000)
      expect(res.body.employee_count).toBe(2)
    })

    it('should return 404 when no match found', async () => {
      const res = await request(app)
        .get('/api/insights/job-title')
        .query({ title: 'Designer', country: 'India' })

      expect(res.status).toBe(404)
    })

    it('should return 422 when title or country is missing', async () => {
      const res = await request(app)
        .get('/api/insights/job-title')
        .query({ title: 'Engineer' })

      expect(res.status).toBe(422)
    })
  })

  describe('GET /api/insights/top-earners', () => {
    it('should return top N earners sorted by salary descending', async () => {
      insightsRepo.seedEmployees([
        makeEmployee({ full_name: 'Low',    salary: 30000 }),
        makeEmployee({ full_name: 'High',   salary: 90000 }),
        makeEmployee({ full_name: 'Medium', salary: 60000 }),
      ])

      const res = await request(app)
        .get('/api/insights/top-earners')
        .query({ limit: '2' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0].full_name).toBe('High')
      expect(res.body[1].full_name).toBe('Medium')
    })

    it('should filter top earners by country when specified', async () => {
      insightsRepo.seedEmployees([
        makeEmployee({ full_name: 'High USA', country: 'USA', salary: 150000 }),
        makeEmployee({ full_name: 'High India', country: 'India', salary: 120000 }),
        makeEmployee({ full_name: 'Low USA', country: 'USA', salary: 80000 }),
      ])

      const res = await request(app)
        .get('/api/insights/top-earners')
        .query({ limit: '5', country: 'USA' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0].full_name).toBe('High USA')
      expect(res.body[1].full_name).toBe('Low USA')
    })

    it('should default to top 10 when limit is not provided', async () => {
      insightsRepo.seedEmployees(
        Array.from({ length: 15 }, (_, i) =>
          makeEmployee({ full_name: `Employee ${i}`, salary: i * 1000 + 1000 })
        )
      )

      const res = await request(app).get('/api/insights/top-earners')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(10)
    })
  })

  describe('GET /api/insights/departments', () => {
    it('should return department distribution', async () => {
      insightsRepo.seedEmployees([
        makeEmployee({ department: 'Engineering', salary: 80000 }),
        makeEmployee({ department: 'HR',          salary: 50000 }),
      ])

      const res = await request(app).get('/api/insights/departments')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0]).toHaveProperty('department')
      expect(res.body[0]).toHaveProperty('avg_salary')
      expect(res.body[0]).toHaveProperty('employee_count')
    })

    it('should filter department distribution by country when specified', async () => {
      insightsRepo.seedEmployees([
        makeEmployee({ department: 'Engineering', country: 'USA', salary: 100000 }),
        makeEmployee({ department: 'Engineering', country: 'India', salary: 50000 }),
        makeEmployee({ department: 'HR',          country: 'USA', salary: 60000 }),
      ])

      const res = await request(app)
        .get('/api/insights/departments')
        .query({ country: 'USA' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      const eng = res.body.find((d: any) => d.department === 'Engineering')
      const hr = res.body.find((d: any) => d.department === 'HR')
      expect(eng.avg_salary).toBe(100000)
      expect(eng.employee_count).toBe(1)
      expect(hr.avg_salary).toBe(60000)
      expect(hr.employee_count).toBe(1)
    })
  })
})
