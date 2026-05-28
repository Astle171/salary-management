import { ValidationError } from '../shared/errors/validation.error'

const VALID_EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract'] as const
type EmploymentType = typeof VALID_EMPLOYMENT_TYPES[number]

export interface ValidatedEmployee {
  full_name: string
  job_title: string
  country: string
  salary: number
  department: string
  employment_type: EmploymentType
  hire_date: Date
}

export class EmployeeValidator {
  static validate(data: Record<string, unknown>): ValidatedEmployee {
    this.requireString(data, 'full_name')
    this.requireString(data, 'job_title')
    this.requireString(data, 'country')
    this.requirePositiveNumber(data, 'salary')
    this.validateEmploymentType(data)

    return {
      full_name: (data.full_name as string).trim(),
      job_title: (data.job_title as string).trim(),
      country: (data.country as string).trim(),
      salary: data.salary as number,
      department: typeof data.department === 'string' && data.department.trim()
        ? data.department.trim()
        : 'General',
      employment_type: (data.employment_type as EmploymentType) ?? 'full_time',
      hire_date: data.hire_date instanceof Date ? data.hire_date : new Date(),
    }
  }

  private static requireString(data: Record<string, unknown>, field: string): void {
    if (!data[field] || typeof data[field] !== 'string' || (data[field] as string).trim() === '') {
      throw new ValidationError(`${field} is required`)
    }
  }

  private static requirePositiveNumber(data: Record<string, unknown>, field: string): void {
    const val = data[field]
    if (val === undefined || val === null || typeof val !== 'number' || isNaN(val) || val <= 0) {
      throw new ValidationError(`${field} must be a positive number`)
    }
  }

  private static validateEmploymentType(data: Record<string, unknown>): void {
    if (data.employment_type === undefined) return
    if (!VALID_EMPLOYMENT_TYPES.includes(data.employment_type as EmploymentType)) {
      throw new ValidationError(
        `employment_type must be one of: ${VALID_EMPLOYMENT_TYPES.join(', ')}`
      )
    }
  }
}
