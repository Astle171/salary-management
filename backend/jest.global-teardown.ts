import { unlink } from 'fs/promises'
import path from 'path'

export default async function globalTeardown(): Promise<void> {
  try {
    await unlink(path.join(__dirname, 'test.db'))
  } catch {
    // already gone — that's fine
  }
}
