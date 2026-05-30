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
    .number({ message: 'Salary must be a number' })
    .positive('Salary must be a positive number'),

  department: z
    .string()
    .optional(),

  employment_type: z
    .enum(['full_time', 'part_time', 'contract']),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>