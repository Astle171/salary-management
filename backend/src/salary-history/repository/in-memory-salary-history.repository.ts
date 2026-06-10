import { randomUUID } from 'crypto'
import { SalaryHistory, CreateSalaryHistoryInput } from '../../shared/types/salary-history.types'
import { ISalaryHistoryRepository } from './salary-history.repository.interface'

export class InMemorySalaryHistoryRepository implements ISalaryHistoryRepository {
  private records: SalaryHistory[] = []

  async create(input: CreateSalaryHistoryInput): Promise<SalaryHistory> {
    const record: SalaryHistory = { ...input, id: randomUUID(), created_at: new Date() }
    this.records.push(record)
    return record
  }

  async findAtDate(employeeId: string, date: Date): Promise<SalaryHistory | null> {
    const matches = this.records
      .filter(r => r.employee_id === employeeId && r.effective_date <= date)
      .sort((a, b) => b.effective_date.getTime() - a.effective_date.getTime())

    return matches[0] ?? null
  }
}
