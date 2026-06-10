import { SalaryHistory, CreateSalaryHistoryInput } from '../../shared/types/salary-history.types'

export interface ISalaryHistoryRepository {
  create(input: CreateSalaryHistoryInput): Promise<SalaryHistory>
  findAtDate(employeeId: string, date: Date): Promise<SalaryHistory | null>
}
