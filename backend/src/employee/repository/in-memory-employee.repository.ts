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

  async find(options: FindOptions): Promise<FindResult> {
    const page = options.page ?? 1
    const limit = options.limit ?? 20

    let results = Array.from(this.store.values())

    if (options.country) {
      results = results.filter(e => e.country === options.country)
    }

    const total = results.length

    const data = results.slice((page - 1) * limit, page * limit)

    return { data, total, page, limit }
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

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) throw new Error('Employee not found')
    this.store.delete(id)
  }
}
