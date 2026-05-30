import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('should render an input element', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should NOT call onChange immediately on typing', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jane' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should call onChange with typed value after 300ms', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jane' } })
    vi.advanceTimersByTime(300)

    expect(onChange).toHaveBeenCalledWith('Jane')
  })

  it('should reset debounce timer when user keeps typing', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'J' } })
    vi.advanceTimersByTime(200)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Ja' } })
    vi.advanceTimersByTime(200) // total 400ms but reset after 'Ja'

    expect(onChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100) // now 300ms since 'Ja'
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})