import { SalaryHistoryService } from './salary-history.service'
import { InMemorySalaryHistoryRepository } from './repository/in-memory-salary-history.repository'

describe('SalaryHistoryService', () => {
  let service: SalaryHistoryService
  let repo: InMemorySalaryHistoryRepository

  beforeEach(() => {
    repo = new InMemorySalaryHistoryRepository()
    service = new SalaryHistoryService(repo)
  })

  describe('recordSnapshot', () => {
    it('creates a salary history record for the given employee', async () => {
      await service.recordSnapshot('emp-1', 80000, 'USD', new Date('2024-01-01'))

      const snapshot = await service.getSalaryAtDate('emp-1', new Date('2024-06-01'))

      expect(snapshot.salary).toBe(80000)
      expect(snapshot.employee_id).toBe('emp-1')
    })
  })

  describe('getSalaryAtDate', () => {
    it('returns the salary active on the given date', async () => {
      await repo.create({ employee_id: 'emp-1', salary: 80000, currency: 'USD', effective_date: new Date('2024-01-01') })

      const result = await service.getSalaryAtDate('emp-1', new Date('2024-06-01'))

      expect(result.salary).toBe(80000)
    })

    it('throws when no salary record exists on or before the given date', async () => {
      await expect(
        service.getSalaryAtDate('emp-1', new Date('2024-01-01'))
      ).rejects.toThrow('No salary record found for this employee on or before the given date')
    })
  })
})
