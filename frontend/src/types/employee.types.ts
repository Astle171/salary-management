export interface Employee {
  id: string
  full_name: string
  job_title: string
  department: string
  country: string
  salary: number
  currency: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  hire_date: string   // ISO string from JSON
  created_at: string
  updated_at: string
}

export interface FindOptions {
  page?: number
  limit?: number
  country?: string
  job_title?: string
  search?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export type CreateEmployeeInput = {
  full_name: string
  job_title: string
  country: string
  salary: number
  department?: string
  currency?: string
  employment_type?: 'full_time' | 'part_time' | 'contract'
  hire_date?: string
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>