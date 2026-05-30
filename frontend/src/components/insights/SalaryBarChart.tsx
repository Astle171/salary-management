import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSalary } from '@/lib/formatters'
import type { DepartmentDistribution } from '@/types/insights.types'

interface SalaryBarChartProps {
  data: DepartmentDistribution[]
  isLoading?: boolean
}

// Consistent palette — cycles if more than 6 departments
const COLOURS = [
  '#6366f1', '#22d3ee', '#f59e0b',
  '#10b981', '#f43f5e', '#8b5cf6',
]

const formatTooltip = (value: number) => [formatSalary(value), 'Avg Salary']

export function SalaryBarChart({ data, isLoading }: SalaryBarChartProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground border rounded-lg">
        No department data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 40, left: 80, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="department"
          tick={{ fontSize: 12 }}
          width={76}
        />
        <Tooltip formatter={formatTooltip} />
        <Bar dataKey="avg_salary" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLOURS[index % COLOURS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}