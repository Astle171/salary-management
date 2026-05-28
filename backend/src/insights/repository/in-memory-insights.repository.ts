import { IInsightsRepository } from './insights.repository.interface'
import { Employee } from '../../shared/types/employee.types'
import {
  CountryStats,
  JobTitleStats,
  DepartmentDistribution,
  TopEarner,
} from '../../shared/types/insights.types'

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
      min_salary:     Math.min(...salaries),
      max_salary:     Math.max(...salaries),
      avg_salary:     salaries.reduce((a, b) => a + b, 0) / salaries.length,
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

    const avg_salary =
      group.reduce((sum, e) => sum + e.salary, 0) / group.length

    return {
      job_title: jobTitle,
      country,
      avg_salary,
      employee_count: group.length,
    }
  }

  async getDepartmentDistribution(): Promise<DepartmentDistribution[]> {
    return [] // implemented later
  }

  async getTopEarners(_limit: number): Promise<TopEarner[]> {
    return [] // implemented later
  }
}
