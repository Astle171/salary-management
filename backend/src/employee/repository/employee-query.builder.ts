import { FindOptions } from '../../shared/types/employee.types'
import { PaginationHelper } from '../../shared/helpers/pagination.helper'

export class EmployeeQueryBuilder {
  static buildWhere(options: FindOptions): Record<string, unknown> {
    return {
      ...(options.country && { country: options.country }),
      ...(options.job_title && { job_title: options.job_title }),
      ...(options.search && {
        full_name: { contains: options.search },
      }),
    }
  }

  static buildPagination(options: FindOptions) {
    return PaginationHelper.resolve(options)
  }
}
