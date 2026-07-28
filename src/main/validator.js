import { readdir, readFile } from 'node:fs/promises'
import { join } from 'path'
import { exists } from './fs-utils.js'
export async function validateFolder(folderPath) {
  const files = await readdir(folderPath)
  const jsonFiles = files.filter((f) => f.endsWith('.json'))
  if (jsonFiles.length === 0) {
    return {
      ok: false,
      error: 'Nessun file JSON trovato nella cartella.',
      documents: []
    }
  }
  const documents = []
  let allOk = true
  for (const fileName of jsonFiles) {
    const base = fileName.replace(/\.json$/, '')
    const parts = base.split('.')
    const format = parts[0] || 'unknown'
    const uuid = parts[1] || ''
    const name = parts.slice(2).join('.') || ''
    const doc = {
      fileName,
      format,
      uuid,
      name,
      title: '',
      language: '',
      errors: [],
      warnings: [],
      files: {
        json: fileName,
        html: null,
        pdf: null,
        xml: null
      }
    }
    const raw = await readFile(join(folderPath, fileName), 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch (e) {
      doc.errors.push(`JSON non valido: ${e.message}`)
      allOk = false
      documents.push(doc)
      continue
    }
    doc.title = data.title || ''
    doc.language = data.language || ''
    if (format === 'html') {
      for (const key of ['uuid', 'title', 'language', 'htmlPath', 'pdfPath', 'xmlPath']) {
        if (!data[key]) {
          doc.errors.push(`Campo mancante: ${key}`)
          allOk = false
        }
      }
    } else {
      for (const key of ['uuid', 'pdfPath', 'xmlPath']) {
        if (!data[key]) {
          doc.errors.push(`Campo mancante: ${key}`)
          allOk = false
        }
      }
    }
    const pathChecks = [
      {
        key: 'htmlPath',
        ext: 'html'
      },
      {
        key: 'pdfPath',
        ext: 'pdf'
      },
      {
        key: 'xmlPath',
        ext: 'xml'
      }
    ]
    for (const { key, ext } of pathChecks) {
      const pathValue = data[key]
      if (!pathValue) continue
      const segments = pathValue.replace(/^\/+/, '').split('/')
      const expectedFileName = segments[segments.length - 1] || ''
      if (!expectedFileName.endsWith(`.${ext}`)) {
        doc.warnings.push(`${key} non punta a un file .${ext}: ${pathValue}`)
        continue
      }
      const fullPath = join(folderPath, expectedFileName)
      if (await exists(fullPath)) {
        doc.files[ext] = expectedFileName
      } else {
        doc.errors.push(`File non trovato: ${expectedFileName}`)
        allOk = false
      }
    }
    if (format !== 'html') {
      doc.warnings.push(`Formato "${format}": solo i JSON di tipo "html" generano pagine nel sito.`)
    }
    if (data.uuid && uuid && data.uuid !== uuid) {
      doc.warnings.push(`UUID nel JSON (${data.uuid}) differisce dal nome file (${uuid})`)
    }
    documents.push(doc)
  }
  return {
    ok: allOk,
    error: allOk ? null : 'Alcuni documenti hanno errori di validazione.',
    documents
  }
}
export async function validateAllFolders(folders) {
  const results = []
  let allOk = true
  for (const folderPath of folders) {
    const result = await validateFolder(folderPath)
    results.push({
      folderPath,
      ...result
    })
    if (!result.ok) allOk = false
  }
  const uuidOwners = new Map()
  for (const r of results) {
    for (const doc of r.documents) {
      if (!doc.uuid) continue
      if (!uuidOwners.has(doc.uuid)) uuidOwners.set(doc.uuid, [])
      uuidOwners.get(doc.uuid).push({
        folderPath: r.folderPath,
        fileName: doc.fileName
      })
    }
  }
  const duplicateUuids = []
  for (const [uuid, owners] of uuidOwners) {
    if (owners.length > 1) {
      duplicateUuids.push({
        uuid,
        owners
      })
      allOk = false
      for (const r of results) {
        for (const doc of r.documents) {
          if (doc.uuid === uuid) {
            const others = owners
              .filter((o) => !(o.folderPath === r.folderPath && o.fileName === doc.fileName))
              .map((o) => o.folderPath)
            doc.errors.push(
              `UUID duplicato in più cartelle: presente anche in ${others.join(', ')}`
            )
          }
        }
      }
    }
  }
  const allUuids = new Set(uuidOwners.keys())
  return {
    ok: allOk,
    folders: results,
    totalDocuments: results.reduce((sum, r) => sum + r.documents.length, 0),
    totalUuids: allUuids.size,
    duplicateUuids
  }
}
