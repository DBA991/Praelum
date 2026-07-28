import { readdir, readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const JSON_DIR = join(projectRoot, 'json');
const REPO_DIR = join(projectRoot, 'repo');
async function exists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}
export async function loadAllMetadata() {
  let files = [];
  try {
    files = await readdir(JSON_DIR);
  } catch {
    return [];
  }
  const results = [];
  for (const fileName of files.filter(f => f.endsWith('.json'))) {
    const base = fileName.replace(/\.json$/, '');
    const parts = base.split('.');
    const format = parts[0] || 'unknown';
    const uuid = parts[1] || base;
    const name = parts.slice(2).join('.') || uuid;
    try {
      const raw = await readFile(join(JSON_DIR, fileName), 'utf8');
      const data = JSON.parse(raw);
      results.push({
        slug: base,
        uuid,
        name,
        format,
        data,
        fileName
      });
    } catch (err) {
      console.warn(`[metadata] JSON non valido, saltato: ${fileName}`, err.message);
    }
  }
  return results;
}
export async function loadHtmlDocuments() {
  const all = await loadAllMetadata();
  const htmlDocs = all.filter(d => d.format === 'html');
  const enriched = [];
  for (const doc of htmlDocs) {
    const {
      htmlPath,
      pdfPath,
      xmlPath
    } = doc.data;
    const htmlDisk = resolve(projectRoot, '.' + (htmlPath || ''));
    const pdfDisk = resolve(projectRoot, '.' + (pdfPath || ''));
    const xmlDisk = resolve(projectRoot, '.' + (xmlPath || ''));
    const htmlExists = htmlPath ? await exists(htmlDisk) : false;
    const pdfExists = pdfPath ? await exists(pdfDisk) : false;
    const xmlExists = xmlPath ? await exists(xmlDisk) : false;
    if (!htmlExists) {
      console.warn(`[metadata] HTML non trovato per ${doc.fileName}: ${htmlPath}. Documento saltato.`);
      continue;
    }
    let htmlContent = '';
    try {
      htmlContent = await readFile(htmlDisk, 'utf8');
    } catch (err) {
      console.warn(`[metadata] Impossibile leggere HTML ${htmlDisk}:`, err.message);
      continue;
    }
    enriched.push({
      uuid: doc.data.uuid || doc.uuid,
      title: doc.data.title || doc.name,
      language: doc.data.language || '',
      slug: doc.slug,
      htmlUrl: htmlPath || '',
      pdfUrl: pdfPath || '',
      xmlUrl: xmlPath || '',
      pdfAvailable: pdfExists,
      xmlAvailable: xmlExists,
      htmlContent
    });
  }
  return enriched;
}
export async function loadHtmlDocument(uuid) {
  const docs = await loadHtmlDocuments();
  return docs.find(d => d.uuid === uuid) || null;
}
export { projectRoot, JSON_DIR, REPO_DIR, exists };