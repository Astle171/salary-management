import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountryFilter } from './CountryFilter'

const COUNTRIES = ['India', 'USA', 'UK']

describe('CountryFilter', () => {
  it('should render a select element', () => {
    render(<CountryFilter value="" onChange={vi.fn()} countries={COUNTRIES} />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should show "All countries" as the default option', () => {
    render(<CountryFilter value="" onChange={vi.fn()} countries={COUNTRIES} />)

    expect(screen.getByRole('option', { name: /all countries/i })).toBeInTheDocument()
  })

  it('should render an option for each country', () => {
    render(<CountryFilter value="" onChange={vi.fn()} countries={COUNTRIES} />)

    expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'USA' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'UK' })).toBeInTheDocument()
  })

  it('should call onChange with selected country when selection changes', async () => {
    const onChange = vi.fn()
    render(<CountryFilter value="" onChange={onChange} countries={COUNTRIES} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'India')

    expect(onChange).toHaveBeenCalledWith('India')
  })

  it('should call onChange with empty string when "All countries" is selected', async () => {
    const onChange = vi.fn()
    render(<CountryFilter value="India" onChange={onChange} countries={COUNTRIES} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), '')

    expect(onChange).toHaveBeenCalledWith('')
  })
})