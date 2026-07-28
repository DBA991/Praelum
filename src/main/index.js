import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { startPreviewServer, stopPreviewServer } from './previewServer.js'
import { validateFolder, validateAllFolders } from './validator.js'
import { generateSite } from './astro-engine.js'
import {
  openFolderDialog,
  openFoldersDialog,
  saveOutputDialog,
  openSiteFolderDialog,
  openOutputPath
} from './filemanager.js'
function attachExternalLinkHandler(win) {
  if (!win.webContents) return
  win.webContents.on('will-navigate', (event, url) => {
    const appUrl = is.dev
      ? process.env['ELECTRON_RENDERER_URL']
      : `file://${join(__dirname, '../renderer/index.html')}`
    if (appUrl && url.startsWith(appUrl)) return
    event.preventDefault()
    shell.openExternal(url)
  })
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {
      action: 'deny'
    }
  })
}
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    minWidth: 700,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon
        }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {
      action: 'deny'
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}
async function openPreviewWindow(sitePath) {
  const { port, url } = await startPreviewServer(sitePath)
  const previewWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    title: 'Praelum',
    ...(process.platform === 'linux'
      ? {
          icon
        }
      : {}),
    webPreferences: {
      sandbox: true
    }
  })
  previewWindow.on('ready-to-show', () => {
    previewWindow.show()
  })
  previewWindow.on('closed', () => {
    stopPreviewServer()
  })
  previewWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {
      action: 'deny'
    }
  })
  await previewWindow.loadURL(url)
  return {
    port,
    url
  }
}
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.praelum.app')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
    attachExternalLinkHandler(window)
  })
  ipcMain.handle('dialog:open-folder', async () => {
    return openFolderDialog()
  })
  ipcMain.handle('dialog:open-folders', async () => {
    return openFoldersDialog()
  })
  ipcMain.handle('dialog:save-output', async () => {
    return saveOutputDialog()
  })
  ipcMain.handle('dialog:open-site-folder', async () => {
    return openSiteFolderDialog()
  })
  ipcMain.handle('build:open-output', async (_event, outputPath) => {
    await openOutputPath(outputPath)
  })
  ipcMain.handle('build:validate-folder', async (_event, folderPath) => {
    return validateFolder(folderPath)
  })
  ipcMain.handle('build:validate-all', async (_event, folderPaths) => {
    return validateAllFolders(folderPaths)
  })
  ipcMain.handle('build:generate-site', async (_event, sourceFolders, outputPath) => {
    const win = BrowserWindow.getFocusedWindow()
    return generateSite(sourceFolders, outputPath, win)
  })
  ipcMain.handle('preview:open', async (_event, sitePath) => {
    try {
      const { url } = await openPreviewWindow(sitePath)
      return {
        success: true,
        url
      }
    } catch (err) {
      return {
        success: false,
        error: err.message
      }
    }
  })
  ipcMain.handle('preview:stop', async () => {
    await stopPreviewServer()
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('before-quit', () => {
  stopPreviewServer()
})
