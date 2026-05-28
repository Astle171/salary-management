export interface Employee {
  id: string
  full_name: string
  job_title: string
  department: string
  country: string
  salary: number
  currency: string
  employment_type: string
  hire_date: Date
  created_at: Date
  updated_at: Date
}

export interface FindOptions {
  page?: number
  limit?: number
  country?: string
  job_title?: string
  search?: string
}

export interface FindResult {
  data: Employee[]
  total: number
  page: number
  limit: number
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'created_at' | 'updated_at'>
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>
