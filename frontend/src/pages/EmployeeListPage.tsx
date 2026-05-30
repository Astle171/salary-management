import { useState } from 'react'
import { EmployeeTable } from '@/components/employee/EmployeeTable'
import { Pagination } from '@/components/employee/Pagination'
import { SearchBar } from '@/components/employee/SearchBar'
import { CountryFilter } from '@/components/employee/CountryFilter'
import { useEmployees } from '@/hooks/useEmployees'

const COUNTRIES = [
  'India', 'USA', 'UK', 'Germany', 'Canada',
  'Australia', 'France', 'Netherlands', 'Singapore', 'Brazil',
]

const LIMIT = 20

export function EmployeeListPage() {
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [country, setCountry] = useState('')

  const { data, isLoading } = useEmployees({ page, limit: LIMIT, search, country })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)   // reset to first page on new search
  }

  const handleCountryChange = (value: string) => {
    setCountry(value)
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.total.toLocaleString()} total employees
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <CountryFilter
          value={country}
          onChange={handleCountryChange}
          countries={COUNTRIES}
        />
      </div>

      {/* Table */}
      <EmployeeTable
        employees={data?.data ?? []}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}