import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import type { Employee } from '@/types/employee.types'

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: '1',
  full_name: 'Carol White',
  job_title: 'Manager',
  department: 'HR',
  country: 'UK',
  salary: 80000,
  currency: 'USD',
  employment_type: 'full_time',
  hire_date: '2023-01-01',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  ...overrides,
})

describe('DeleteConfirmDialog', () => {
  describe('content', () => {
    it('should show the employee full_name in the message', () => {
      render(
        <DeleteConfirmDialog
          open={true}
          employee={makeEmployee({ full_name: 'Carol White' })}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText(/carol white/i)).toBeInTheDocument()
    })

    it('should not render when open is false', () => {
      render(
        <DeleteConfirmDialog
          open={false}
          employee={makeEmployee()}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should call onConfirm when the Delete button is clicked', async () => {
      const onConfirm = vi.fn()
      render(
        <DeleteConfirmDialog
          open={true}
          employee={makeEmployee()}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: /delete/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when the Cancel button is clicked', async () => {
      const onCancel = vi.fn()
      render(
        <DeleteConfirmDialog
          open={true}
          employee={makeEmployee()}
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when the backdrop is clicked', async () => {
      const onCancel = vi.fn()
      const { container } = render(
        <DeleteConfirmDialog
          open={true}
          employee={makeEmployee()}
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />
      )

      const backdrop = container.querySelector('[aria-hidden="true"]')
      if (backdrop) await userEvent.click(backdrop)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })
})