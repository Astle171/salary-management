import request from 'supertest'
import express from 'express'
import { createApp } from '../app'
import { EmployeeService } from './employee.service'
import { InMemoryEmployeeRepository } from './repository/in-memory-employee.repository'

const makeValidInput = (overrides = {}) => ({
  full_name: 'Jane Doe',
  job_title: 'Engineer',
  country: 'India',
  salary: 60000,
  ...overrides,
})

describe('Employee Routes', () => {
  let repo: InMemoryEmployeeRepository
  let app: express.Express

  beforeEach(() => {
    repo = new InMemoryEmployeeRepository()
    const employeeService = new EmployeeService(repo)
    app = createApp({ employeeService })
  })

  describe('GET /api/employees', () => {
    it('should return 200 with paginated employee list', async () => {
      await repo.create({
        full_name: 'Alice', job_title: 'Engineer', department: 'Engineering',
        country: 'India', salary: 60000, currency: 'USD',
        employment_type: 'full_time', hire_date: new Date(),
      })

      const res = await request(app).get('/api/employees')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.total).toBe(1)
      expect(res.body.page).toBe(1)
      expect(res.body.limit).toBe(20)
    })

    it('should return 200 with empty list when no employees', async () => {
      const res = await request(app).get('/api/employees')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(0)
      expect(res.body.total).toBe(0)
    })

    it('should support page and limit query params', async () => {
      for (let i = 0; i < 5; i++) {
        await repo.create({
          full_name: `Employee ${i}`, job_title: 'Engineer',
          department: 'Engineering', country: 'India', salary: 60000,
          currency: 'USD', employment_type: 'full_time', hire_date: new Date(),
        })
      }

      const res = await request(app).get('/api/employees?page=2&limit=2')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.page).toBe(2)
    })
  })
})
