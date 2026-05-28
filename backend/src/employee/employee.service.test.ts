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
})
