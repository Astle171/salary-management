import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // Show a window of max 5 pages centred around current
  const getPageNumbers = (): number[] => {
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end   = Math.min(totalPages, currentPage + delta)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <div className="flex items-center gap-1" role="navigation" aria-label="pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Prev"
      >
        Prev
      </Button>

      {getPageNumbers().map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          aria-label={String(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(page === currentPage && 'pointer-events-none')}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next"
      >
        Next
      </Button>
    </div>
  )
}