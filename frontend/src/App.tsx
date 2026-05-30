import { useState } from 'react'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import { InsightsDashboard } from '@/pages/InsightsDashboard'
import './App.css'

type Tab = 'employees' | 'insights'

function App() {
  const [tab, setTab] = useState<Tab>('employees')

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 h-12 items-end">
          {(['employees', 'insights'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      {tab === 'employees' ? <EmployeeListPage /> : <InsightsDashboard />}
    </div>
  )
}

export default App
