import { FindOptions } from '../../shared/types/employee.types'

export class EmployeeQueryBuilder {
  static buildWhere(options: FindOptions): Record<string, unknown> {
    return {
      ...(options.country && { country: options.country }),
      ...(options.job_title && { job_title: options.job_title }),
      ...(options.search && {
        full_name: { contains: options.search, mode: 'insensitive' },
      }),
    }
  }

  static buildPagination(options: FindOptions): { skip: number; take: number; page: number; limit: number } {
    const page = options.page ?? 1
    const limit = options.limit ?? 20
    return { skip: (page - 1) * limit, take: limit, page, limit }
  }
}
