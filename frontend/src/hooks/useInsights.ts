import { useQuery } from '@tanstack/react-query'
import { insightsApi } from '@/api/insights.api'
import { queryKeys } from '@/lib/query-keys'

export function useCountryStats(country: string) {
  return useQuery({
    queryKey:  queryKeys.insights.country(country),
    queryFn:   () => insightsApi.getCountryStats(country),
    enabled:   !!country,          // only fire when a country is selected
    retry:     false,              // 404 is expected when no data — don't retry
  })
}

export function useDepartmentDistribution(country?: string) {
  return useQuery({
    queryKey: queryKeys.insights.departments(country),
    queryFn:  () => insightsApi.getDepartmentDistribution(country),
  })
}

export function useTopEarners(limit = 10, country?: string) {
  return useQuery({
    queryKey: queryKeys.insights.topEarners(limit, country),
    queryFn:  () => insightsApi.getTopEarners(limit, country),
  })
}