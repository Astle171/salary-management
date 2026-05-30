import { render, screen } from '@testing-library/react'
import { EmployeeTable } from './EmployeeTable'
import type { Employee } from '@/types/employee.types'

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: '1',
  full_name: 'Jane Doe',
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

describe('EmployeeTable', () => {
  describe('rendering rows', () => {
    it('should render one row per employee', () => {
      const employees = [
        makeEmployee({ id: '1', full_name: 'Alice Smith' }),
        makeEmployee({ id: '2', full_name: 'Bob Jones' }),
      ]

      render(<EmployeeTable employees={employees} />)

      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    })

    it('should display job title and country for each employee', () => {
      render(
        <EmployeeTable
          employees={[makeEmployee({ job_title: 'Designer', country: 'USA' })]}
        />
      )

      expect(screen.getByText('Designer')).toBeInTheDocument()
      expect(screen.getByText('USA')).toBeInTheDocument()
    })

    it('should display formatted salary', () => {
      render(
        <EmployeeTable employees={[makeEmployee({ salary: 75000 })]} />
      )

      expect(screen.getByText('$75,000')).toBeInTheDocument()
    })
  })
})