interface CountryFilterProps {
  value: string
  onChange: (country: string) => void
  countries: string[]
}

export function CountryFilter({ value, onChange, countries }: CountryFilterProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-10 rounded-md border border-input bg-background px-3 py-2
                 text-sm ring-offset-background focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Filter by country"
    >
      <option value="">All countries</option>
      {countries.map(country => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  )
}