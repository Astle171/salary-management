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
    _jobTitle: string,
    _country: string
  ): Promise<JobTitleStats | null> {
    return null // implemented next
  }

  async getDepartmentDistribution(): Promise<DepartmentDistribution[]> {
    return [] // implemented later
  }

  async getTopEarners(_limit: number): Promise<TopEarner[]> {
    return [] // implemented later
  }
}
