import { z } from 'zod'

export const employeeFormSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required'),

  job_title: z
    .string()
    .min(1, 'Job title is required'),

  country: z
    .string()
    .min(1, 'Country is required'),

  salary: z
    .number({ invalid_type_error: 'Salary must be a number' })
    .positive('Salary must be a positive number'),

  department: z
    .string()
    .optional()
    .default('General'),

  employment_type: z
    .enum(['full_time', 'part_time', 'contract'])
    .default('full_time'),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>