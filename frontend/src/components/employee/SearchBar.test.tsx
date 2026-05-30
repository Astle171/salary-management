import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('should render an input element', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should NOT call onChange immediately on typing', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'Jane')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should call onChange with typed value after 300ms', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'Jane')
    vi.advanceTimersByTime(300)

    expect(onChange).toHaveBeenCalledWith('Jane')
  })

  it('should reset debounce timer when user keeps typing', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'J')
    vi.advanceTimersByTime(200)

    await userEvent.type(screen.getByRole('textbox'), 'a')
    vi.advanceTimersByTime(200) // total 400ms but reset after 'a'

    expect(onChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100) // now 300ms since 'a'
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})