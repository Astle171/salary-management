import { useState } from 'react'
import { StatCard } from '@/components/insights/StatCard'
import { SalaryBarChart } from '@/components/insights/SalaryBarChart'
import { CountryFilter } from '@/components/employee/CountryFilter'
import {
  useCountryStats,
  useDepartmentDistribution,
  useTopEarners,
} from '@/hooks/useInsights'
import { formatSalary } from '@/lib/formatters'

const COUNTRIES = [
  'India', 'USA', 'UK', 'Germany', 'Canada',
  'Australia', 'France', 'Netherlands', 'Singapore', 'Brazil',
]

const TOP_N = 10

export function InsightsDashboard() {
  const [country, setCountry] = useState('')

  const { data: countryStats, isLoading: statsLoading } = useCountryStats(country)
  const { data: departments  = [], isLoading: deptsLoading  } = useDepartmentDistribution()
  const { data: topEarners   = [], isLoading: earnersLoading } = useTopEarners(TOP_N)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Salary Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organisation-wide salary analytics
        </p>
      </div>

      {/* Country selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Filter by country:</span>
        <CountryFilter
          value={country}
          onChange={setCountry}
          countries={COUNTRIES}
        />
      </div>

      {/* Country stat cards */}
      {country && (
        <section aria-label="Country salary statistics">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-lg border animate-pulse bg-muted" />
              ))}
            </div>
          ) : countryStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Min Salary"
                value={countryStats.min_salary}
                description={country}
              />
              <StatCard
                label="Max Salary"
                value={countryStats.max_salary}
                description={country}
              />
              <StatCard
                label="Avg Salary"
                value={countryStats.avg_salary}
                description={country}
              />
              <StatCard
                label="Headcount"
                value={countryStats.employee_count}
                format="number"
                description={`employees in ${country}`}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No salary data found for <strong>{country}</strong>.
            </p>
          )}
        </section>
      )}

      {/* Department + Top Earners side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Department distribution */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Avg Salary by Department</h2>
          <SalaryBarChart data={departments} isLoading={deptsLoading} />
        </section>

        {/* Top earners */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Top {TOP_N} Earners</h2>
          {earnersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: TOP_N }).map((_, i) => (
                <div key={i} className="h-10 rounded animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['#', 'Name', 'Title', 'Salary'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topEarners.map((emp, i) => (
                    <tr key={emp.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{emp.full_name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{emp.job_title}</td>
                      <td className="px-4 py-2 font-mono">
                        {formatSalary(emp.salary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}