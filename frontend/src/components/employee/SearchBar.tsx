import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by name…',
}: SearchBarProps) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync if parent resets value (e.g. clear button)
  useEffect(() => { setLocal(value) }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setLocal(next)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(next)
    }, 300)
  }

  return (
    <Input
      type="text"
      value={local}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label="Search employees"
    />
  )
}