import { prisma } from '../../lib/prisma'
import { IInsightsRepository } from './insights.repository.interface'
import { SalaryAggregator } from '../../shared/helpers/salary-aggregator'
import type {
  CountryStats,
  JobTitleStats,
  DepartmentDistribution,
  TopEarner,
} from '../../shared/types/insights.types'

export class PrismaInsightsRepository implements IInsightsRepository {
  async getCountryStats(country: string): Promise<CountryStats | null> {
    const rows = await prisma.employee.findMany({
      where:  { country },
      select: { salary: true },
    })
    if (rows.length === 0) return null

    const salaries = rows.map(r => r.salary)
    return {
      country,
      ...SalaryAggregator.summary(salaries),
      employee_count: salaries.length,
    }
  }

  async getJobTitleStats(
    jobTitle: string,
    country: string
  ): Promise<JobTitleStats | null> {
    const rows = await prisma.employee.findMany({
      where:  { job_title: jobTitle, country },
      select: { salary: true },
    })
    if (rows.length === 0) return null

    const salaries = rows.map(r => r.salary)
    return {
      job_title:      jobTitle,
      country,
      avg_salary:     SalaryAggregator.avg(salaries),
      employee_count: salaries.length,
    }
  }

  async getDepartmentDistribution(country?: string): Promise<DepartmentDistribution[]> {
    const where = country ? { country } : {}
    const rows = await prisma.employee.groupBy({
      where,
      by:      ['department'],
      _avg:    { salary: true },
      _count:  { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    return rows.map(r => ({
      department:     r.department,
      avg_salary:     Math.round(r._avg.salary ?? 0),
      employee_count: r._count.id,
    }))
  }

  async getTopEarners(limit: number, country?: string): Promise<TopEarner[]> {
    const where = country ? { country } : {}
    const rows = await prisma.employee.findMany({
      where,
      orderBy: { salary: 'desc' },
      take:    limit,
      select:  { id: true, full_name: true, job_title: true, country: true, salary: true },
    })
    return rows
  }
}
