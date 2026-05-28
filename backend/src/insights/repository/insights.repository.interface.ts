import {
  CountryStats,
  JobTitleStats,
  DepartmentDistribution,
  TopEarner,
} from '../../shared/types/insights.types'

// Separate interface from IEmployeeRepository — Interface Segregation (I)
// InsightsService never needs to create/update/delete employees
export interface IInsightsRepository {
  getCountryStats(country: string): Promise<CountryStats | null>
  getJobTitleStats(jobTitle: string, country: string): Promise<JobTitleStats | null>
  getDepartmentDistribution(): Promise<DepartmentDistribution[]>
  getTopEarners(limit: number): Promise<TopEarner[]>
}
