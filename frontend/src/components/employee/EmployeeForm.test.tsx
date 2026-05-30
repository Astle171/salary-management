import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeForm } from './EmployeeForm'

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