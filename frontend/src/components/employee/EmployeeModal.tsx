import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmployeeForm } from './EmployeeForm'
import type { Employee } from '@/types/employee.types'
import type { EmployeeFormValues } from './employee-form.schema'

interface EmployeeModalProps {
  open: boolean
  onClose: () => void
  employee?: Employee         // present = edit mode, absent = create mode
  onSubmit: (data: EmployeeFormValues) => Promise<void> | void
  isSubmitting?: boolean
}

export function EmployeeModal({
  open,
  onClose,
  employee,
  onSubmit,
  isSubmitting = false,
}: EmployeeModalProps) {
  const title = employee ? 'Edit Employee' : 'Add Employee'

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <EmployeeForm
          defaultValues={employee}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}