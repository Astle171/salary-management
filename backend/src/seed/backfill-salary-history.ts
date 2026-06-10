import 'dotenv/config'
import { prisma } from '../lib/prisma'

const BATCH_SIZE = 500

const backfill = async (): Promise<void> => {
  console.log('🔄 Starting salary history backfill...')
  const start = Date.now()

  const employees = await prisma.employee.findMany({
    where: { salary_history: { none: {} } },
    select: { id: true, salary: true, currency: true, hire_date: true },
  })

  if (employees.length === 0) {
    console.log('⏭️  All employees already have salary history. Skipping.')
    return
  }

  console.log(`  Found ${employees.length} employees with no salary history`)

  const records = employees.map(e => ({
    employee_id: e.id,
    salary:      e.salary,
    currency:    e.currency,
    effective_date: e.hire_date,
  }))

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await prisma.salaryHistory.createMany({ data: batch })

    const done = Math.min(i + BATCH_SIZE, records.length)
    process.stdout.write(`\r  Backfilled ${done} / ${records.length} employees...`)
  }

  process.stdout.write('\n')

  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  console.log(`✅ Backfilled ${employees.length} salary history records in ${elapsed}s`)
}

backfill()
  .catch(err => {
    console.error('❌ Backfill failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
