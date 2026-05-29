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

  describe('POST /api/employees', () => {
    it('should return 201 with the created employee', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send(makeValidInput())

      expect(res.status).toBe(201)
      expect(res.body.id).toBeDefined()
      expect(res.body.full_name).toBe('Jane Doe')
      expect(res.body.salary).toBe(60000)
    })

    it('should return 422 when full_name is missing', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({ job_title: 'Engineer', country: 'India', salary: 60000 })

      expect(res.status).toBe(422)
      expect(res.body.error).toBeDefined()
    })

    it('should return 422 when salary is negative', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send(makeValidInput({ salary: -100 }))

      expect(res.status).toBe(422)
      expect(res.body.error).toBeDefined()
    })
  })

  describe('GET /api/employees/:id', () => {
    it('should return 200 with the employee when found', async () => {
      const created = await repo.create({
        full_name: 'Bob', job_title: 'Designer', department: 'Design',
        country: 'USA', salary: 70000, currency: 'USD',
        employment_type: 'full_time', hire_date: new Date(),
      })

      const res = await request(app).get(`/api/employees/${created.id}`)

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(created.id)
      expect(res.body.full_name).toBe('Bob')
    })

    it('should return 404 when employee does not exist', async () => {
      const res = await request(app).get('/api/employees/non-existent-id')

      expect(res.status).toBe(404)
      expect(res.body.error).toBeDefined()
    })
  })

  describe('PUT /api/employees/:id', () => {
    it('should return 200 with the updated employee', async () => {
      const created = await repo.create({
        full_name: 'Carol', job_title: 'Engineer', department: 'Engineering',
        country: 'India', salary: 50000, currency: 'USD',
        employment_type: 'full_time', hire_date: new Date(),
      })

      const res = await request(app)
        .put(`/api/employees/${created.id}`)
        .send({ salary: 75000 })

      expect(res.status).toBe(200)
      expect(res.body.salary).toBe(75000)
      expect(res.body.full_name).toBe('Carol')
    })

    it('should return 404 when employee does not exist', async () => {
      const res = await request(app)
        .put('/api/employees/bad-id')
        .send({ salary: 75000 })

      expect(res.status).toBe(404)
    })

    it('should return 422 when update data is invalid', async () => {
      const created = await repo.create({
        full_name: 'Carol', job_title: 'Engineer', department: 'Engineering',
        country: 'India', salary: 50000, currency: 'USD',
        employment_type: 'full_time', hire_date: new Date(),
      })

      const res = await request(app)
        .put(`/api/employees/${created.id}`)
        .send({ salary: -999 })

      expect(res.status).toBe(422)
    })
  })
})
