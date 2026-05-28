import { EmployeeService } from './employee.service'
import { InMemoryEmployeeRepository } from './repository/in-memory-employee.repository'
import { ValidationError } from '../shared/errors/validation.error'

const makeValidInput = (overrides = {}) => ({
  full_name: 'Jane Doe',
  job_title: 'Engineer',
  country: 'India',
  salary: 60000,
  ...overrides,
})

describe('EmployeeService', () => {
  let repo: InMemoryEmployeeRepository
  let service: EmployeeService

  beforeEach(() => {
    repo = new InMemoryEmployeeRepository()
    service = new EmployeeService(repo)
  })

  describe('create', () => {
    it('should store and return a new employee when data is valid', async () => {
      const result = await service.create(makeValidInput())

      expect(result.id).toBeDefined()
      expect(result.full_name).toBe('Jane Doe')
      expect(result.job_title).toBe('Engineer')
      expect(result.country).toBe('India')
      expect(result.salary).toBe(60000)
      expect(result.currency).toBe('USD')

      const count = await repo.count()
      expect(count).toBe(1)
    })

    it('should throw ValidationError when full_name is missing', async () => {
      await expect(
        service.create(makeValidInput({ full_name: '' }))
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when salary is negative', async () => {
      await expect(
        service.create(makeValidInput({ salary: -500 }))
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when country is missing', async () => {
      await expect(
        service.create(makeValidInput({ country: '' }))
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('update', () => {
    it('should update only the provided fields', async () => {
      const created = await service.create(makeValidInput())

      const updated = await service.update(created.id, { salary: 80000 })

      expect(updated.salary).toBe(80000)
      expect(updated.full_name).toBe('Jane Doe')
    })

    it('should throw ValidationError when salary update is negative', async () => {
      const created = await service.create(makeValidInput())

      await expect(
        service.update(created.id, { salary: -1 })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when salary update is zero', async () => {
      const created = await service.create(makeValidInput())

      await expect(
        service.update(created.id, { salary: 0 })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('delete', () => {
    it('should delete an existing employee', async () => {
      const created = await service.create(makeValidInput())

      await service.delete(created.id)

      const count = await repo.count()
      expect(count).toBe(0)
    })

    it('should throw when employee does not exist', async () => {
      await expect(
        service.delete('non-existent-id')
      ).rejects.toThrow('Employee not found')
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      await service.create(makeValidInput({ full_name: 'Alice', country: 'India' }))
      await service.create(makeValidInput({ full_name: 'Bob',   country: 'India' }))
      await service.create(makeValidInput({ full_name: 'Carol', country: 'USA'   }))
    })

    it('should return all employees with total', async () => {
      const result = await service.list({})

      expect(result.total).toBe(3)
      expect(result.data.length).toBe(3)
    })

    it('should return paginated results', async () => {
      const result = await service.list({ page: 1, limit: 2 })

      expect(result.data.length).toBe(2)
      expect(result.total).toBe(3)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(2)
    })

    it('should filter by country', async () => {
      const result = await service.list({ country: 'India' })

      expect(result.total).toBe(2)
      expect(result.data.every(e => e.country === 'India')).toBe(true)
    })

    it('should search by name', async () => {
      const result = await service.list({ search: 'alice' })

      expect(result.total).toBe(1)
      expect(result.data[0].full_name).toBe('Alice')
    })
  })
})
