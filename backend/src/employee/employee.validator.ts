import { ValidationError } from '../shared/errors/validation.error'

export class EmployeeValidator {
  static validate(data: Record<string, unknown>): void {
    if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim() === '') {
      throw new ValidationError('full_name is required')
    }
  }
}
