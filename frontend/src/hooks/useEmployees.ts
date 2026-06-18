import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { employeeApi } from '@/api/employee.api'
import { queryKeys } from '@/lib/query-keys'
import type { FindOptions } from '@/types/employee.types'

export function useEmployees(options: FindOptions = {}) {
  return useQuery({
    queryKey: queryKeys.employees.list(options),
    queryFn:  () => employeeApi.list(options),
    placeholderData: keepPreviousData,
  })
}