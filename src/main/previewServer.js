import express from 'express'
import { createServer } from 'node:net'
import { existsSync } from 'node:fs'
let currentServer = null
let currentPort = null
let currentSitePath = null
function findFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}
export async function startPreviewServer(sitePath) {
  if (!existsSync(sitePath)) {
    throw new Error(`Cartella del sito non trovata: ${sitePath}`)
  }
  await stopPreviewServer()
  const app = express()
  app.use(
    express.static(sitePath, {
      extensions: ['html']
    })
  )
  app.use((req, res) => {
    res.sendFile(
      'index.html',
      {
        root: sitePath
      },
      (err) => {
        if (err) res.status(404).send('Pagina non trovata nel sito generato.')
      }
    )
  })
  const port = await findFreePort()
  await new Promise((resolvePromise, reject) => {
    const srv = app.listen(port, '127.0.0.1', () => resolvePromise())
    srv.on('error', reject)
    currentServer = srv
  })
  currentPort = port
  currentSitePath = sitePath
  return {
    port,
    url: `http://127.0.0.1:${port}`
  }
}
export function stopPreviewServer() {
  return new Promise((resolvePromise) => {
    if (!currentServer) {
      resolvePromise()
      return
    }
    const srv = currentServer
    currentServer = null
    currentPort = null
    currentSitePath = null
    srv.close(() => resolvePromise())
  })
}
export function getPreviewServerState() {
  return {
    port: currentPort,
    sitePath: currentSitePath,
    active: currentServer !== null
  }
}
