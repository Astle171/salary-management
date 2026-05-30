import { IInsightsRepository } from './insights.repository.interface'
import { Employee } from '../../shared/types/employee.types'
import {
  CountryStats,
  JobTitleStats,
  DepartmentDistribution,
  TopEarner,
} from '../../shared/types/insights.types'
import { SalaryAggregator } from '../../shared/helpers/salary-aggregator'

export class InMemoryInsightsRepository implements IInsightsRepository {
  private employees: Employee[] = []

  seedEmployees(employees: Employee[]): void {
    this.employees = employees
  }

  async getCountryStats(country: string): Promise<CountryStats | null> {
    const group = this.employees.filter(e => e.country === country)
    if (group.length === 0) return null

    const salaries = group.map(e => e.salary)
    return {
      country,
      ...SalaryAggregator.summary(salaries),
      employee_count: group.length,
    }
  }

  async getJobTitleStats(
    jobTitle: string,
    country: string
  ): Promise<JobTitleStats | null> {
    const group = this.employees.filter(
      e => e.job_title === jobTitle && e.country === country
    )
    if (group.length === 0) return null

    const salaries = group.map(e => e.salary)
    return {
      job_title: jobTitle,
      country,
      avg_salary: SalaryAggregator.avg(salaries),
      employee_count: group.length,
    }
  }

  async getDepartmentDistribution(country?: string): Promise<DepartmentDistribution[]> {
    const groups = new Map<string, number[]>()

    const filtered = country
      ? this.employees.filter(e => e.country === country)
      : this.employees

    for (const e of filtered) {
      const salaries = groups.get(e.department) ?? []
      salaries.push(e.salary)
      groups.set(e.department, salaries)
    }

    return Array.from(groups.entries()).map(([department, salaries]) => ({
      department,
      employee_count: salaries.length,
      avg_salary:     SalaryAggregator.avg(salaries),
    }))
  }

  async getTopEarners(limit: number, country?: string): Promise<TopEarner[]> {
    const filtered = country
      ? this.employees.filter(e => e.country === country)
      : this.employees

    return [...filtered]
      .sort((a, b) => b.salary - a.salary)
      .slice(0, limit)
      .map(e => ({
        id:        e.id,
        full_name: e.full_name,
        job_title: e.job_title,
        country:   e.country,
        salary:    e.salary,
      }))
  }
}
