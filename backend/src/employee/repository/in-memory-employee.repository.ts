import { randomUUID } from 'crypto'
import { IEmployeeRepository } from './employee.repository.interface'
import {
  Employee,
  FindOptions,
  FindResult,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../../shared/types/employee.types'

export class InMemoryEmployeeRepository implements IEmployeeRepository {
  private store: Map<string, Employee> = new Map()

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const now = new Date()
    const employee: Employee = {
      ...input,
      id: randomUUID(),
      created_at: now,
      updated_at: now,
    }
    this.store.set(employee.id, employee)
    return employee
  }

  async count(): Promise<number> {
    return this.store.size
  }

  async findById(_id: string): Promise<Employee | null> {
    return null
  }

  async find(_options: FindOptions): Promise<FindResult> {
    return { data: [], total: 0, page: 1, limit: 20 }
  }

  async update(_id: string, _input: UpdateEmployeeInput): Promise<Employee> {
    throw new Error('Not implemented')
  }

  async delete(_id: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
