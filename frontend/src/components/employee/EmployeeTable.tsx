import { Skeleton } from '@/components/ui/skeleton'
import { formatSalary } from '@/lib/formatters'
import type { Employee } from '@/types/employee.types'

interface EmployeeTableProps {
  employees: Employee[]
  isLoading?: boolean
}

const COLUMNS = ['Full Name', 'Job Title', 'Country', 'Salary']

// Locked column widths — table-fixed prevents reflow between skeleton and real data
const COL_WIDTHS = ['28%', '38%', '16%', '18%']

// Varied skeleton widths per column so rows look organic, not all identical bars
const SKELETON_WIDTHS = [
  ['w-3/5', 'w-2/3', 'w-3/5', 'w-1/2'],
  ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/2'],
  ['w-1/2', 'w-3/5', 'w-3/5', 'w-1/2'],
  ['w-2/3', 'w-3/4', 'w-1/2', 'w-1/2'],
  ['w-3/5', 'w-2/5', 'w-3/5', 'w-1/2'],
  ['w-2/5', 'w-3/5', 'w-2/3', 'w-1/2'],
]

const SKELETON_ROWS = 10

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  return (
    <div className="rounded-md border overflow-hidden min-h-[420px]">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          {COL_WIDTHS.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead className="bg-muted/50">
          <tr>
            {COLUMNS.map(col => (
              <th
                key={col}
                className="px-4 py-3 text-left font-medium text-muted-foreground truncate"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} className="border-t">
                {COLUMNS.map((col, colIdx) => (
                  <td key={col} className="px-4 py-3">
                    <Skeleton className={`h-4 ${SKELETON_WIDTHS[i % 6][colIdx]}`} />
                  </td>
                ))}
              </tr>
            ))
          ) : employees.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-4 py-12 text-center text-muted-foreground"
              >
                No employees found
              </td>
            </tr>
          ) : (
            employees.map(emp => (
              <tr key={emp.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium truncate">{emp.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground truncate">{emp.job_title}</td>
                <td className="px-4 py-3 truncate">{emp.country}</td>
                <td className="px-4 py-3 font-mono">{formatSalary(emp.salary, emp.currency)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
