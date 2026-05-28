import { prisma } from '../../lib/prisma'
import { IEmployeeRepository } from './employee.repository.interface'
import { EmployeeQueryBuilder } from './employee-query.builder'
import {
  Employee,
  FindOptions,
  FindResult,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../../shared/types/employee.types'

export class PrismaEmployeeRepository implements IEmployeeRepository {
  async create(input: CreateEmployeeInput): Promise<Employee> {
    return prisma.employee.create({ data: input }) as Promise<Employee>
  }

  async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { id } }) as Promise<Employee | null>
  }

  async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
    return prisma.employee.update({
      where: { id },
      data: input,
    }) as Promise<Employee>
  }

  async delete(id: string): Promise<void> {
    await prisma.employee.delete({ where: { id } })
  }

  async count(): Promise<number> {
    return prisma.employee.count()
  }

  async find(options: FindOptions): Promise<FindResult> {
    const { skip, limit, page } = EmployeeQueryBuilder.buildPagination(options)
    const where = EmployeeQueryBuilder.buildWhere(options)

    const [data, total] = await Promise.all([
      prisma.employee.findMany({ where, skip, take: limit }),
      prisma.employee.count({ where }),
    ])

    return { data: data as Employee[], total, page, limit }
  }
}
