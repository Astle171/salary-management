import { z } from 'zod'

export const GetSalaryAtDateQuerySchema = z.object({
  date: z.coerce.date(),
})
