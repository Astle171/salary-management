import { execSync } from 'child_process'
import path from 'path'

export default async function globalSetup(): Promise<void> {
  console.log('\n🧪 Creating test database...')

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: path.join(__dirname),
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
    },
    stdio: 'pipe',
  })

  console.log('✅ test.db ready\n')
}
