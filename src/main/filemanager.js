import { dialog, shell } from 'electron'
export async function openFolderDialog() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Seleziona una cartella con documenti serializzati'
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
}
export async function openFoldersDialog() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections'],
    title: 'Seleziona una o più cartelle con documenti serializzati'
  })
  if (result.canceled || result.filePaths.length === 0) {
    return []
  }
  return result.filePaths
}
export async function saveOutputDialog() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Seleziona dove salvare il sito generato'
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
}
export async function openSiteFolderDialog() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Seleziona la cartella di un sito Pulpitum generato'
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
}
export async function openOutputPath(outputPath) {
  await shell.openPath(outputPath)
}
