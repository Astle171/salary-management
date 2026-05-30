import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('should call onPageChange with correct page when a page number is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: '3' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('should call onPageChange with next page when Next is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('should call onPageChange with previous page when Prev is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: /prev/i }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should disable Prev button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
  })

  it('should disable Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})