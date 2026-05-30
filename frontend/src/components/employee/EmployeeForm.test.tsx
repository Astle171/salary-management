import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeForm } from './EmployeeForm'
import type { Employee } from '@/types/employee.types'

// Helper to fill all required fields except the one being tested
const fillRequired = async (overrides: Record<string, string> = {}) => {
  const fields: Record<string, string> = {
    'Full name':  'Jane Doe',
    'Job title':  'Engineer',
    'Country':    'India',
    'Salary':     '60000',
    ...overrides,
  }
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.queryByLabelText(new RegExp(label, 'i'))
    if (!input) continue
    await userEvent.clear(input)
    if (value) await userEvent.type(input, value)
  }
}

describe('EmployeeForm', () => {
  describe('validation — required fields', () => {
    it('should show error when full_name is empty on submit', async () => {
      render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

      // Submit without touching full_name
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(
        await screen.findByText(/full name is required/i)
      ).toBeInTheDocument()
    })
  })
})

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: '1',
  full_name: 'Alice Smith',
  job_title: 'Designer',
  department: 'Design',
  country: 'USA',
  salary: 75000,
  currency: 'USD',
  employment_type: 'full_time',
  hire_date: '2023-01-01',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  ...overrides,
})

describe('edit mode', () => {
  it('should pre-fill full_name from defaultValues', () => {
    render(
      <EmployeeForm
        defaultValues={makeEmployee()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Alice Smith')
  })

  it('should pre-fill job_title from defaultValues', () => {
    render(
      <EmployeeForm
        defaultValues={makeEmployee({ job_title: 'Engineer' })}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/job title/i)).toHaveValue('Engineer')
  })

  it('should pre-fill salary from defaultValues', () => {
    render(
      <EmployeeForm
        defaultValues={makeEmployee({ salary: 95000 })}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/salary/i)).toHaveValue(95000)
  })

  it('should pre-fill employment_type from defaultValues', () => {
    render(
      <EmployeeForm
        defaultValues={makeEmployee({ employment_type: 'contract' })}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/employment type/i)).toHaveValue('contract')
  })
})