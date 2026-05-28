import { FindOptions } from '../types/employee.types'

export interface PaginationResult {
  page: number
  limit: number
  skip: number
}

export class PaginationHelper {
  static readonly DEFAULT_PAGE  = 1
  static readonly DEFAULT_LIMIT = 20

  static resolve(options: FindOptions): PaginationResult {
    const page  = options.page  && options.page  > 0 ? options.page  : this.DEFAULT_PAGE
    const limit = options.limit && options.limit > 0 ? options.limit : this.DEFAULT_LIMIT
    return { page, limit, skip: (page - 1) * limit }
  }
}
