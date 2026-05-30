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

  getTopEarners: (limit = 10, country?: string): Promise<TopEarner[]> => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (country) params.append('country', country)
    return apiClient.get(`${BASE}/top-earners?${params.toString()}`)
  },

  getDepartmentDistribution: (country?: string): Promise<DepartmentDistribution[]> => {
    const query = country ? `?country=${encodeURIComponent(country)}` : ''
    return apiClient.get(`${BASE}/departments${query}`)
  },
}