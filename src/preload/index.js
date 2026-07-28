import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const api = {
  openFolder: () => ipcRenderer.invoke('dialog:open-folder'),
  openFolders: () => ipcRenderer.invoke('dialog:open-folders'),
  validateFolder: (folderPath) => ipcRenderer.invoke('build:validate-folder', folderPath),
  validateAll: (folderPaths) => ipcRenderer.invoke('build:validate-all', folderPaths),
  saveOutput: () => ipcRenderer.invoke('dialog:save-output'),
  generateSite: (sourceFolders, outputPath) =>
    ipcRenderer.invoke('build:generate-site', sourceFolders, outputPath),
  openOutput: (outputPath) => ipcRenderer.invoke('build:open-output', outputPath),
  onBuildLog: (callback) => {
    const subscription = (_event, message) => callback(message)
    ipcRenderer.on('build:log', subscription)
    return () => ipcRenderer.removeListener('build:log', subscription)
  },
  openSiteFolderDialog: () => ipcRenderer.invoke('dialog:open-site-folder'),
  openPreview: (sitePath) => ipcRenderer.invoke('preview:open', sitePath),
  stopPreview: () => ipcRenderer.invoke('preview:stop'),
  getPathForFile: (file) => webUtils.getPathForFile(file)
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
