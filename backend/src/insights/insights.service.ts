import { IInsightsRepository } from './repository/insights.repository.interface'
import {
  CountryStats,
  JobTitleStats,
  DepartmentDistribution,
  TopEarner,
} from '../shared/types/insights.types'

export class InsightsService {
  constructor(private readonly repo: IInsightsRepository) {}

  async getCountryStats(country: string): Promise<CountryStats | null> {
    return this.repo.getCountryStats(country)
  }

  async getJobTitleStats(
    jobTitle: string,
    country: string
  ): Promise<JobTitleStats | null> {
    return this.repo.getJobTitleStats(jobTitle, country)
  }

  async getDepartmentDistribution(): Promise<DepartmentDistribution[]> {
    return this.repo.getDepartmentDistribution()
  }
}


