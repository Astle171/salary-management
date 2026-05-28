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
    if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim() === '') {
      throw new ValidationError('full_name is required')
    }

    if (!data.job_title || typeof data.job_title !== 'string' || data.job_title.trim() === '') {
      throw new ValidationError('job_title is required')
    }

    if (!data.country || typeof data.country !== 'string' || data.country.trim() === '') {
      throw new ValidationError('country is required')
    }

    if (
      data.salary === undefined ||
      data.salary === null ||
      typeof data.salary !== 'number' ||
      isNaN(data.salary) ||
      data.salary <= 0
    ) {
      throw new ValidationError('salary must be a positive number')
    }

    if (
      data.employment_type !== undefined &&
      !VALID_EMPLOYMENT_TYPES.includes(data.employment_type as EmploymentType)
    ) {
      throw new ValidationError(
        `employment_type must be one of: ${VALID_EMPLOYMENT_TYPES.join(', ')}`
      )
    }

    return {
      full_name: data.full_name.trim(),
      job_title: data.job_title.trim(),
      country: data.country.trim(),
      salary: data.salary,
      department: typeof data.department === 'string' && data.department.trim()
        ? data.department.trim()
        : 'General',
      employment_type: (data.employment_type as EmploymentType) ?? 'full_time',
      hire_date: data.hire_date instanceof Date
        ? data.hire_date
        : new Date(),
    }
  }
}
