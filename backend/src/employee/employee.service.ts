import { IEmployeeRepository } from './repository/employee.repository.interface'
import { EmployeeValidator } from './employee.validator'
import { ValidationError } from '../shared/errors/validation.error'
import {
  Employee,
  UpdateEmployeeInput,
} from '../shared/types/employee.types'

export class EmployeeService {
  constructor(private readonly repo: IEmployeeRepository) {}

  async create(data: unknown): Promise<Employee> {
    // Validation is fully delegated to EmployeeValidator (Single Responsibility).
    // ValidationError propagates to the caller unchanged.
    const validated = EmployeeValidator.validate(data as Record<string, unknown>)
    return this.repo.create({
      ...validated,
      currency: 'USD',
    })
  }

  async update(id: string, data: unknown): Promise<Employee> {
    const input = data as Record<string, unknown>
    const sanitized: UpdateEmployeeInput = {}

    if (input.salary !== undefined) {
      if (
        typeof input.salary !== 'number' ||
        isNaN(input.salary as number) ||
        (input.salary as number) <= 0
      ) {
        throw new ValidationError('salary must be a positive number')
      }
      sanitized.salary = input.salary as number
    }

    if (input.full_name !== undefined) {
      if (typeof input.full_name !== 'string' || input.full_name.trim() === '') {
        throw new ValidationError('full_name is required')
      }
      sanitized.full_name = (input.full_name as string).trim()
    }

    if (input.job_title !== undefined) {
      if (typeof input.job_title !== 'string' || input.job_title.trim() === '') {
        throw new ValidationError('job_title is required')
      }
      sanitized.job_title = (input.job_title as string).trim()
    }

    if (input.country !== undefined) {
      if (typeof input.country !== 'string' || input.country.trim() === '') {
        throw new ValidationError('country is required')
      }
      sanitized.country = (input.country as string).trim()
    }

    if (input.department !== undefined) {
      sanitized.department = String(input.department).trim() || 'General'
    }

    return this.repo.update(id, sanitized)
  }
}
