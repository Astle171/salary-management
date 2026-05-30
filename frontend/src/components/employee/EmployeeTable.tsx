import { Skeleton } from '@/components/ui/skeleton'
import { formatSalary } from '@/lib/formatters'
import type { Employee } from '@/types/employee.types'

interface EmployeeTableProps {
  employees: Employee[]
  isLoading?: boolean
  onEdit?: (employee: Employee) => void
  onDelete?: (employee: Employee) => void
}

const COLUMNS = ['Full Name', 'Job Title', 'Country', 'Salary', 'Actions']

export function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {COLUMNS.map(col => (
              <th
                key={col}
                className="px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                {COLUMNS.map(col => (
                  <td key={col} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
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
                <td className="px-4 py-3 font-medium">{emp.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{emp.job_title}</td>
                <td className="px-4 py-3">{emp.country}</td>
                <td className="px-4 py-3 font-mono">{formatSalary(emp.salary, emp.currency)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(emp)} className="text-xs text-blue-600 hover:underline">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(emp)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}