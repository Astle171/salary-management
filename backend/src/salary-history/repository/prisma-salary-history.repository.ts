import { prisma } from '../../lib/prisma'
import { ISalaryHistoryRepository } from './salary-history.repository.interface'
import { SalaryHistory, CreateSalaryHistoryInput } from '../../shared/types/salary-history.types'

export class PrismaSalaryHistoryRepository implements ISalaryHistoryRepository {
  async create(input: CreateSalaryHistoryInput): Promise<SalaryHistory> {
    return prisma.salaryHistory.create({ data: input }) as Promise<SalaryHistory>
  }

  async findAtDate(employeeId: string, date: Date): Promise<SalaryHistory | null> {
    return prisma.salaryHistory.findFirst({
      where: {
        employee_id: employeeId,
        effective_date: { lte: date },
      },
      orderBy: { effective_date: 'desc' },
    }) as Promise<SalaryHistory | null>
  }
}
