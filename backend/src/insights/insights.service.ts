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
}
