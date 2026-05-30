import { apiClient } from './client'
import type {
  Employee,
  FindOptions,
  PaginatedResult,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '@/types/employee.types'

const BASE = '/api/employees'

const toQueryString = (params: Record<string, any>): string => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const employeeApi = {
  list: (options: FindOptions = {}): Promise<PaginatedResult<Employee>> =>
    apiClient.get(`${BASE}${toQueryString(options)}`),

  getById: (id: string): Promise<Employee> =>
    apiClient.get(`${BASE}/${id}`),

  create: (input: CreateEmployeeInput): Promise<Employee> =>
    apiClient.post(BASE, input),

  update: (id: string, input: UpdateEmployeeInput): Promise<Employee> =>
    apiClient.put(`${BASE}/${id}`, input),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`),
}