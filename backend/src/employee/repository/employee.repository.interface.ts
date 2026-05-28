import {
  Employee,
  FindOptions,
  FindResult,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../../shared/types/employee.types'

export interface IEmployeeRepository {
  find(options: FindOptions): Promise<FindResult>
  findById(id: string): Promise<Employee | null>
  create(input: CreateEmployeeInput): Promise<Employee>
  update(id: string, input: UpdateEmployeeInput): Promise<Employee>
  delete(id: string): Promise<void>
  count(): Promise<number>
}
