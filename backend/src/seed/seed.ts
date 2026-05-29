import 'dotenv/config'
import path from 'path'
import { prisma } from '../lib/prisma'
import { NameGenerator } from './name-generator'
import { EmployeeGenerator } from './employee-generator'

const TOTAL         = 10_000
const BATCH_SIZE    = 500
const DATA_DIR      = path.join(__dirname, '../../data')
const FIRST_NAMES   = path.join(DATA_DIR, 'first_names.txt')
const LAST_NAMES    = path.join(DATA_DIR, 'last_names.txt')

const batchInsert = async (records: object[]): Promise<void> => {
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await prisma.employee.createMany({ data: batch as any })

    const done = Math.min(i + BATCH_SIZE, records.length)
    process.stdout.write(`\r  Inserted ${done} / ${records.length} employees...`)
  }
  process.stdout.write('\n')
}

const seed = async (): Promise<void> => {
  console.log('🌱 Starting seed...')
  const start = Date.now()

  const firstNames = NameGenerator.readLines(FIRST_NAMES)
  const lastNames  = NameGenerator.readLines(LAST_NAMES)
  console.log(`  Loaded ${firstNames.length} first names, ${lastNames.length} last names`)

  const names   = NameGenerator.generateUnique(firstNames, lastNames, TOTAL)
  const records = EmployeeGenerator.generate(names)
  console.log(`  Generated ${records.length} employee records`)

  await batchInsert(records)

  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  console.log(`✅ Seeded ${TOTAL} employees in ${elapsed}s`)
}

seed()
  .catch(err => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())