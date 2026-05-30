import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  describe('label', () => {
    it('should render the label', () => {
      render(<StatCard label="Average Salary" value={60000} />)

      expect(screen.getByText('Average Salary')).toBeInTheDocument()
    })
  })

  describe('value formatting', () => {
    it('should format value as currency by default', () => {
      render(<StatCard label="Min Salary" value={40000} format="currency" />)

      expect(screen.getByText('$40,000')).toBeInTheDocument()
    })

    it('should format value as plain number when format is "number"', () => {
      render(<StatCard label="Total Employees" value={1200} format="number" />)

      expect(screen.getByText('1,200')).toBeInTheDocument()
    })

    it('should default to currency format when format is not provided', () => {
      render(<StatCard label="Max Salary" value={120000} />)

      expect(screen.getByText('$120,000')).toBeInTheDocument()
    })
  })

  describe('description', () => {
    it('should render description when provided', () => {
      render(
        <StatCard label="Avg Salary" value={70000} description="Across all departments" />
      )

      expect(screen.getByText('Across all departments')).toBeInTheDocument()
    })

    it('should not render description when not provided', () => {
      const { container } = render(<StatCard label="Avg Salary" value={70000} />)

      expect(container.querySelector('.description')).not.toBeInTheDocument()
    })
  })
})