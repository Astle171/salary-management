import { ISalaryHistoryRepository } from './repository/salary-history.repository.interface'
import { SalaryHistory } from '../shared/types/salary-history.types'

export class SalaryHistoryService {
  constructor(private readonly repo: ISalaryHistoryRepository) {}

  async getSalaryAtDate(employeeId: string, date: Date): Promise<SalaryHistory> {
    const record = await this.repo.findAtDate(employeeId, date)
    if (!record) throw new Error('No salary record found for this employee on or before the given date')
    return record
  }
}
