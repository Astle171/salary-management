import { ValidationError } from '../shared/errors/validation.error'

export class EmployeeValidator {
  static validate(data: Record<string, unknown>): void {
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
  }
}
