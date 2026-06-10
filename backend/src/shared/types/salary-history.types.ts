export interface SalaryHistory {
  id: string
  employee_id: string
  salary: number
  currency: string
  effective_date: Date
  created_at: Date
}

export type CreateSalaryHistoryInput = Omit<SalaryHistory, 'id' | 'created_at'>
