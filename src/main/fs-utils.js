import { access } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'path'
import { app } from 'electron'
export async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}
export function getEnginePath() {
  const unpackedPath = join(
    process.resourcesPath,
    'app.asar.unpacked',
    'resources',
    'pulpitum-engine'
  )
  if (existsSync(unpackedPath)) {
    return unpackedPath
  }
  return join(app.getAppPath(), 'resources', 'pulpitum-engine')
}
