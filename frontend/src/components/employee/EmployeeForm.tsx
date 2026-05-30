import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeFormSchema, type EmployeeFormValues } from './employee-form.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Employee } from '@/types/employee.types'

interface EmployeeFormProps {
  defaultValues?: Partial<Employee>
  onSubmit: (data: EmployeeFormValues) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
}

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
] as const

export function EmployeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name:       defaultValues?.full_name       ?? '',
      job_title:       defaultValues?.job_title       ?? '',
      country:         defaultValues?.country         ?? '',
      salary:          defaultValues?.salary          ?? ('' as unknown as number),
      department:      defaultValues?.department      ?? '',
      employment_type: defaultValues?.employment_type ?? 'full_time',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field label="Full name" error={errors.full_name?.message}>
        <Input
          {...register('full_name')}
          id="full_name"
          aria-label="Full name"
          placeholder="e.g. Jane Doe"
          className={cn(errors.full_name && 'border-destructive')}
        />
      </Field>

      <Field label="Job title" error={errors.job_title?.message}>
        <Input
          {...register('job_title')}
          id="job_title"
          aria-label="Job title"
          placeholder="e.g. Software Engineer"
          className={cn(errors.job_title && 'border-destructive')}
        />
      </Field>

      <Field label="Country" error={errors.country?.message}>
        <Input
          {...register('country')}
          id="country"
          aria-label="Country"
          placeholder="e.g. India"
          className={cn(errors.country && 'border-destructive')}
        />
      </Field>

      <Field label="Salary" error={errors.salary?.message}>
        <Input
          {...register('salary', { valueAsNumber: true })}
          id="salary"
          aria-label="Salary"
          type="number"
          min={1}
          placeholder="e.g. 60000"
          className={cn(errors.salary && 'border-destructive')}
        />
      </Field>

      <Field label="Department" error={errors.department?.message}>
        <Input
          {...register('department')}
          id="department"
          aria-label="Department"
          placeholder="e.g. Engineering"
        />
      </Field>

      <Field label="Employment type" error={errors.employment_type?.message}>
        <select
          {...register('employment_type')}
          id="employment_type"
          aria-label="Employment type"
          className="h-10 w-full rounded-md border border-input bg-background
                     px-3 py-2 text-sm focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-ring"
        >
          {EMPLOYMENT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}