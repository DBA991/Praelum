import { app } from 'electron'
import { join } from 'path'
import { readdir, cp, rm, mkdir } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { exists, getEnginePath } from './fs-utils.js'
export async function generateSite(sourceFolders, outputPath, mainWindow) {
  const enginePath = getEnginePath()
  const timestamp = Date.now()
  const tmpRoot = app.getPath('temp')
  const workspace = join(tmpRoot, `pulpitum-build-${timestamp}`)
  const sendLog = (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('build:log', msg)
    }
  }
  try {
    sendLog('📦 Preparazione workspace...')
    await mkdir(workspace, {
      recursive: true
    })
    await cp(enginePath, join(workspace, 'workspace'), {
      recursive: true
    })
    sendLog('✓ Motore Pulpitum copiato')
    const ws = join(workspace, 'workspace')
    await mkdir(join(ws, 'json'), {
      recursive: true
    })
    await mkdir(join(ws, 'repo', 'html'), {
      recursive: true
    })
    await mkdir(join(ws, 'repo', 'pdf'), {
      recursive: true
    })
    await mkdir(join(ws, 'repo', 'xml'), {
      recursive: true
    })
    await mkdir(join(ws, 'public'), {
      recursive: true
    })
    sendLog('✓ Struttura directory creata')
    sendLog(
      `📚 ${sourceFolders.length} cartell${sourceFolders.length === 1 ? 'a' : 'e'} da unire in un unico sito`
    )
    let totalFiles = 0
    for (const [index, sourcePath] of sourceFolders.entries()) {
      sendLog(`📂 [${index + 1}/${sourceFolders.length}] Lettura: ${sourcePath}`)
      const files = await readdir(sourcePath)
      let folderFiles = 0
      for (const file of files) {
        const src = join(sourcePath, file)
        if (file.endsWith('.json')) {
          await cp(src, join(ws, 'json', file))
          totalFiles++
          folderFiles++
        } else if (file.endsWith('.html')) {
          await cp(src, join(ws, 'repo', 'html', file))
          totalFiles++
          folderFiles++
        } else if (file.endsWith('.pdf')) {
          await cp(src, join(ws, 'repo', 'pdf', file))
          totalFiles++
          folderFiles++
        } else if (file.endsWith('.xml')) {
          await cp(src, join(ws, 'repo', 'xml', file))
          totalFiles++
          folderFiles++
        }
      }
      sendLog(`  → ${folderFiles} file elaborati`)
    }
    sendLog(`✓ ${totalFiles} file copiati nel workspace da ${sourceFolders.length} cartelle`)
    sendLog('⏳ Installazione dipendenze Astro...')
    execSync('npm install', {
      cwd: ws,
      timeout: 180000,
      stdio: 'pipe'
    })
    sendLog('✓ Dipendenze installate')
    sendLog('🔍 Validazione coerenza file...')
    try {
      const validateOutput = execSync('node scripts/build-helper.js validate', {
        cwd: ws,
        timeout: 30000,
        encoding: 'utf8',
        stdio: 'pipe'
      })
      if (validateOutput) sendLog(validateOutput.trim())
    } catch (e) {
      const stderr = e.stderr?.trim() || ''
      if (stderr) sendLog(`⚠ ${stderr}`)
      else sendLog(`⚠ ${e.message}`)
    }
    sendLog('🏗️  Generazione sito statico con Astro...')
    const buildOutput = execSync('npm run build', {
      cwd: ws,
      timeout: 300000,
      encoding: 'utf8',
      stdio: 'pipe'
    })
    if (buildOutput) {
      for (const line of buildOutput.trim().split('\n')) {
        if (line.trim()) sendLog(line.trim())
      }
    }
    sendLog('✓ Sito generato con successo')
    const distDir = join(ws, 'dist')
    await mkdir(outputPath, {
      recursive: true
    })
    await cp(distDir, outputPath, {
      recursive: true
    })
    sendLog(`✓ Sito copiato in: ${outputPath}`)
    const indexHtml = join(outputPath, 'index.html')
    const docCount = (await exists(indexHtml)) ? '1 indice + documenti' : 'documenti'
    sendLog(`📄 Pagine generate: ${docCount}`)
    sendLog('🧹 Pulizia...')
    await rm(workspace, {
      recursive: true,
      force: true
    })
    sendLog('✓ Workspace temporaneo rimosso')
    return {
      success: true,
      outputPath,
      error: null
    }
  } catch (err) {
    sendLog(`✗ Errore: ${err.message}`)
    try {
      await rm(workspace, {
        recursive: true,
        force: true
      })
    } catch (_) {}
    return {
      success: false,
      outputPath,
      error: err.message
    }
  }
}
