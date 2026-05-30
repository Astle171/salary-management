export interface CountryStats {
  country: string
  min_salary: number
  max_salary: number
  avg_salary: number
  employee_count: number
}

export interface JobTitleStats {
  job_title: string
  country: string
  avg_salary: number
  employee_count: number
}

export interface DepartmentDistribution {
  department: string
  employee_count: number
  avg_salary: number
}

export interface TopEarner {
  id: string
  full_name: string
  job_title: string
  country: string
  salary: number
}