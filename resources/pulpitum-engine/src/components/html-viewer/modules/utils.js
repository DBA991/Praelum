export function escapeHtml(unsafe) {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
export function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Id$/, 'ID')
    .replace(/Msname/, 'Ms Name')
    .replace(/Orgname/, 'Org Name')
    .replace(/Pubplace/, 'Publication Place')
}
export function isElementVisible(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) {
    return false
  }
  let current = element.parentElement
  while (current) {
    const parentStyle = window.getComputedStyle(current)
    if (
      parentStyle.display === 'none' ||
      parentStyle.visibility === 'hidden' ||
      parentStyle.opacity === '0'
    ) {
      return false
    }
    current = current.parentElement
  }
  return true
}
export async function loadXml(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`)
    }
    const text = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(text, 'text/xml')
  } catch (error) {
    console.error('Errore durante il caricamento del file XML:', error)
    return null
  }
}
export function generateSlug(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}
export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
