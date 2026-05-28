import { prisma } from '../../lib/prisma'
import { IEmployeeRepository } from './employee.repository.interface'
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
    const page = options.page ?? 1
    const limit = options.limit ?? 20
    const skip = (page - 1) * limit

    const where = {
      ...(options.country && { country: options.country }),
      ...(options.job_title && { job_title: options.job_title }),
      ...(options.search && {
        full_name: { contains: options.search, mode: 'insensitive' as const },
      }),
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany({ where, skip, take: limit }),
      prisma.employee.count({ where }),
    ])

    return { data: data as Employee[], total, page, limit }
  }
}
