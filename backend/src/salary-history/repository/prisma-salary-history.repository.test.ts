import { PrismaSalaryHistoryRepository } from './prisma-salary-history.repository'
import { prisma } from '../../lib/prisma'

describe('PrismaSalaryHistoryRepository', () => {
  let repo: PrismaSalaryHistoryRepository

  beforeAll(async () => {
    repo = new PrismaSalaryHistoryRepository()
    await prisma.salaryHistory.deleteMany()
  })

  afterEach(async () => {
    await prisma.salaryHistory.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('create', () => {
    it('persists a salary history record and returns it with an id', async () => {
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
    it('returns the most recent salary on or before the given date', async () => {
      await repo.create({ employee_id: 'emp-1', salary: 70000, currency: 'USD', effective_date: new Date('2023-01-01') })
      await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-01-01') })

      const result = await repo.findAtDate('emp-1', new Date('2024-06-01'))

      expect(result?.salary).toBe(80000)
    })

    it('returns null when no record exists on or before the given date', async () => {
      await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-06-01') })

      const result = await repo.findAtDate('emp-1', new Date('2024-01-01'))

      expect(result).toBeNull()
    })
  })
})
