import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeModal } from './EmployeeModal'
import type { Employee } from '@/types/employee.types'

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: '1',
  full_name: 'Bob Jones',
  job_title: 'Engineer',
  department: 'Engineering',
  country: 'India',
  salary: 60000,
  currency: 'USD',
  employment_type: 'full_time',
  hire_date: '2023-01-01',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  ...overrides,
})

describe('EmployeeModal', () => {
  describe('visibility', () => {
    it('should render the dialog when open is true', () => {
      render(
        <EmployeeModal open={true} onClose={vi.fn()} onSubmit={vi.fn()} />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should NOT render the dialog when open is false', () => {
      render(
        <EmployeeModal open={false} onClose={vi.fn()} onSubmit={vi.fn()} />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('title', () => {
    it('should show "Add Employee" when no employee is provided', () => {
      render(
        <EmployeeModal open={true} onClose={vi.fn()} onSubmit={vi.fn()} />
      )

      expect(screen.getByText('Add Employee')).toBeInTheDocument()
    })

    it('should show "Edit Employee" when an employee is provided', () => {
      render(
        <EmployeeModal
          open={true}
          employee={makeEmployee()}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      )

      expect(screen.getByText('Edit Employee')).toBeInTheDocument()
    })
  })

  describe('closing', () => {
    it('should call onClose when Cancel is clicked inside the form', async () => {
      const onClose = vi.fn()
      render(
        <EmployeeModal open={true} onClose={onClose} onSubmit={vi.fn()} />
      )

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when the backdrop is clicked', async () => {
      const onClose = vi.fn()
      const { container } = render(
        <EmployeeModal open={true} onClose={onClose} onSubmit={vi.fn()} />
      )

      // Click the semi-transparent backdrop (first child of the portal)
      const backdrop = container.querySelector('[aria-hidden="true"]')
      if (backdrop) await userEvent.click(backdrop)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})