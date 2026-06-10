import { ISalaryHistoryRepository } from './repository/salary-history.repository.interface'
import { SalaryHistory } from '../shared/types/salary-history.types'
import { NotFoundError } from '../shared/errors/not-found.error'

export class SalaryHistoryService {
  constructor(private readonly repo: ISalaryHistoryRepository) {}

  async recordSnapshot(employeeId: string, salary: number, currency: string, effectiveDate: Date): Promise<SalaryHistory> {
    return this.repo.create({ employee_id: employeeId, salary, currency, effective_date: effectiveDate })
  }

  async getSalaryAtDate(employeeId: string, date: Date): Promise<SalaryHistory> {
    const record = await this.repo.findAtDate(employeeId, date)
    if (!record) throw new NotFoundError('No salary record found for this employee on or before the given date')
    return record
  }
}
