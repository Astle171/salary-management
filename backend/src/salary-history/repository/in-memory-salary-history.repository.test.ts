import { InMemorySalaryHistoryRepository } from './in-memory-salary-history.repository'

describe('InMemorySalaryHistoryRepository', () => {
  let repo: InMemorySalaryHistoryRepository

  beforeEach(() => {
    repo = new InMemorySalaryHistoryRepository()
  })

  describe('create', () => {
    it('stores a salary history record and returns it with an id', async () => {
      const record = await repo.create({
        employee_id: 'emp-1',
        salary: 80000,
        currency: 'USD',
        effective_date: new Date('2024-01-01'),
      })

      expect(record.id).toBeDefined()
      expect(record.salary).toBe(80000)
      expect(record.employee_id).toBe('emp-1')
    })
  })

  describe('findAtDate', () => {
    it('returns the active salary record on the exact effective date', async () => {
      await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-01-01') })

      const result = await repo.findAtDate('emp-1', new Date('2024-01-01'))

      expect(result?.salary).toBe(80000)
    })

    it('returns the most recent salary when multiple records exist before the query date', async () => {
      await repo.create({ employee_id: 'emp-1', salary: 70000, currency: 'USD', effective_date: new Date('2023-01-01') })
      await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-01-01') })

      const result = await repo.findAtDate('emp-1', new Date('2024-06-01'))

      expect(result?.salary).toBe(80000)
    })

    it('returns null when no record exists on or before the query date', async () => {
      await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-06-01') })

      const result = await repo.findAtDate('emp-1', new Date('2024-01-01'))

      expect(result).toBeNull()
    })

    it('does not return records belonging to a different employee', async () => {
      await repo.create({ employee_id: 'emp-2', salary: 90000, currency: 'USD', effective_date: new Date('2023-01-01') })

      const result = await repo.findAtDate('emp-1', new Date('2024-01-01'))

      expect(result).toBeNull()
    })
  })
})
