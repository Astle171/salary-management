import { z } from 'zod'

export const CreateEmployeeSchema = z.object({
  full_name:       z.string().min(1, 'full_name is required'),
  job_title:       z.string().min(1, 'job_title is required'),
  country:         z.string().min(1, 'country is required'),
  salary:          z.number().positive('salary must be a positive number'),
  department:      z.string().optional(),
  currency:        z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract']).optional(),
  hire_date:       z.coerce.date().optional(),
})

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial()

export const ListEmployeesQuerySchema = z.object({
  page:      z.coerce.number().positive().optional(),
  limit:     z.coerce.number().positive().optional(),
  country:   z.string().optional(),
  job_title: z.string().optional(),
  search:    z.string().optional(),
})
