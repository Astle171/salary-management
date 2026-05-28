import { InMemoryEmployeeRepository } from './in-memory-employee.repository'

const makeEmployee = (overrides = {}) => ({
  full_name: 'John Doe',
  job_title: 'Engineer',
  department: 'General',
  country: 'India',
  salary: 50000,
  currency: 'USD',
  employment_type: 'full_time',
  hire_date: new Date('2023-01-01'),
  ...overrides,
})

describe('InMemoryEmployeeRepository', () => {
  let repo: InMemoryEmployeeRepository

  beforeEach(() => {
    repo = new InMemoryEmployeeRepository()
  })

  describe('create', () => {
    it('should store an employee and return it with an id', async () => {
      const result = await repo.create(makeEmployee())

      expect(result.id).toBeDefined()
      expect(result.full_name).toBe('John Doe')
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
    })

    it('should store multiple employees independently', async () => {
      await repo.create(makeEmployee({ full_name: 'Alice' }))
      await repo.create(makeEmployee({ full_name: 'Bob' }))

      const count = await repo.count()
      expect(count).toBe(2)
    })
  })

  describe('findById', () => {
    it('should return the employee with the matching id', async () => {
      const created = await repo.create(makeEmployee())

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.full_name).toBe('John Doe')
    })

    it('should return null when id does not exist', async () => {
      const found = await repo.findById('non-existent-id')

      expect(found).toBeNull()
    })
  })
})
