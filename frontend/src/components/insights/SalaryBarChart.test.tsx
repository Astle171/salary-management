import { render, screen } from '@testing-library/react'
import { SalaryBarChart } from './SalaryBarChart'
import type { DepartmentDistribution } from '@/types/insights.types'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ data, children }: any) => (
    <div data-testid="bar-chart">
      {data?.map((item: any) => (
        <span key={item.department} data-testid="bar-item">
          {item.department}
        </span>
      ))}
      {children}
    </div>
  ),
  Bar:           () => null,
  XAxis:         () => null,
  YAxis:         () => null,
  CartesianGrid: () => null,
  Tooltip:       () => null,
  Cell:          () => null,
}))

const makeDistribution = (
  department: string,
  avg_salary: number,
  employee_count = 5
): DepartmentDistribution => ({ department, avg_salary, employee_count })

describe('SalaryBarChart', () => {
  describe('bar count', () => {
    it('should render one bar item per department in data', () => {
      const data = [
        makeDistribution('Engineering', 80000),
        makeDistribution('HR',          50000),
        makeDistribution('Design',      65000),
      ]

      render(<SalaryBarChart data={data} />)

      expect(screen.getAllByTestId('bar-item')).toHaveLength(3)
    })

    it('should render the department name for each bar', () => {
      const data = [
        makeDistribution('Engineering', 80000),
        makeDistribution('HR',          50000),
      ]

      render(<SalaryBarChart data={data} />)

      expect(screen.getAllByTestId('bar-item')[0].textContent).toBe('Engineering')
      expect(screen.getAllByTestId('bar-item')[1].textContent).toBe('HR')
    })
  })

  describe('empty state', () => {
    it('should show empty message when data is empty', () => {
      render(<SalaryBarChart data={[]} />)

      expect(screen.getByText(/no department data/i)).toBeInTheDocument()
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show skeleton when isLoading is true', () => {
      render(<SalaryBarChart data={[]} isLoading />)

      expect(document.querySelector('.skeleton-shimmer')).toBeInTheDocument()
      expect(screen.queryByText(/no department data/i)).not.toBeInTheDocument()
    })
  })
})