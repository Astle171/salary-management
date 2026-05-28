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

  async findById(id: string): Promise<Employee | null> {
    return this.store.get(id) ?? null
  }

  async find(_options: FindOptions): Promise<FindResult> {
    return { data: [], total: 0, page: 1, limit: 20 }
  }

  async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
    const existing = this.store.get(id)
    if (!existing) throw new Error('Employee not found')

    const updated: Employee = {
      ...existing,
      ...input,
      id,
      updated_at: new Date(),
    }
    this.store.set(id, updated)
    return updated
  }

  async delete(_id: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
