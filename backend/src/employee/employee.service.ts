import { IEmployeeRepository } from './repository/employee.repository.interface'
import { EmployeeValidator } from './employee.validator'
import { Employee } from '../shared/types/employee.types'

export class EmployeeService {
  constructor(private readonly repo: IEmployeeRepository) {}

  async create(data: unknown): Promise<Employee> {
    const validated = EmployeeValidator.validate(data as Record<string, unknown>)
    return this.repo.create({
      ...validated,
      currency: 'USD',
    })
  }
}
