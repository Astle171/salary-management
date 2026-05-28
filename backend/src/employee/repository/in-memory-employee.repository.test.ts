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

  describe('update', () => {
    it('should update only the specified fields', async () => {
      const created = await repo.create(makeEmployee({ salary: 50000 }))

      const updated = await repo.update(created.id, { salary: 75000 })

      expect(updated.salary).toBe(75000)
      expect(updated.full_name).toBe('John Doe')
      expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(
        created.updated_at.getTime()
      )
    })

    it('should throw when updating a non-existent employee', async () => {
      await expect(
        repo.update('bad-id', { salary: 1000 })
      ).rejects.toThrow('Employee not found')
    })
  })

  describe('delete', () => {
    it('should remove the employee from the store', async () => {
      const created = await repo.create(makeEmployee())

      await repo.delete(created.id)

      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })

    it('should throw when deleting a non-existent employee', async () => {
      await expect(repo.delete('bad-id')).rejects.toThrow('Employee not found')
    })
  })

  describe('find', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        await repo.create(makeEmployee({ full_name: `Employee ${i}` }))
      }
    })

    it('should return all employees with default pagination', async () => {
      const result = await repo.find({})

      expect(result.total).toBe(5)
      expect(result.data.length).toBe(5)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should return correct page when limit is applied', async () => {
      const result = await repo.find({ page: 2, limit: 2 })

      expect(result.data.length).toBe(2)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(2)
      expect(result.total).toBe(5)
    })

    it('should return empty data when page exceeds total', async () => {
      const result = await repo.find({ page: 10, limit: 20 })

      expect(result.data.length).toBe(0)
      expect(result.total).toBe(5)
    })

    it('should filter employees by country', async () => {
      await repo.create(makeEmployee({ full_name: 'Extra', country: 'USA' }))

      const result = await repo.find({ country: 'India' })

      expect(result.total).toBe(5)
      expect(result.data.every(e => e.country === 'India')).toBe(true)
    })

    it('should filter employees by job_title', async () => {
      await repo.create(makeEmployee({ full_name: 'PM', job_title: 'Product Manager' }))

      const result = await repo.find({ job_title: 'Engineer' })

      expect(result.total).toBe(5)
      expect(result.data.every(e => e.job_title === 'Engineer')).toBe(true)
    })

    it('should search employees by full_name case-insensitively', async () => {
      const result = await repo.find({ search: 'employee 1' })

      expect(result.total).toBe(1)
      expect(result.data[0].full_name).toBe('Employee 1')
    })
  })
})
