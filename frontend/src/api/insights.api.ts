import { apiClient } from './client'
import type {
  CountryStats,
  JobTitleStats,
  DepartmentDistribution,
  TopEarner,
} from '@/types/insights.types'

const BASE = '/api/insights'

export const insightsApi = {
  getCountryStats: (country: string): Promise<CountryStats> =>
    apiClient.get(`${BASE}/country/${encodeURIComponent(country)}`),

  getJobTitleStats: (title: string, country: string): Promise<JobTitleStats> =>
    apiClient.get(`${BASE}/job-title?title=${encodeURIComponent(title)}&country=${encodeURIComponent(country)}`),

  getTopEarners: (limit = 10): Promise<TopEarner[]> =>
    apiClient.get(`${BASE}/top-earners?limit=${limit}`),

  getDepartmentDistribution: (): Promise<DepartmentDistribution[]> =>
    apiClient.get(`${BASE}/departments`),
}