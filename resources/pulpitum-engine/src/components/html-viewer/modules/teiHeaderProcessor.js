import { processTeiAnnotations } from './teiProcessor'
export function extractAndProcessTeiHeader(contentArea) {
  const teiHeaderElement = contentArea.querySelector("[data-tag='teiheader']")
  if (!teiHeaderElement) {
    return ''
  }
  const headerClone = teiHeaderElement.cloneNode(true)
  headerClone.setAttribute('data-tag', 'teiheader-cloned')
  headerClone.classList.remove('tei-teiheader')
  headerClone.classList.add('tei-teiheader-cloned')
  removeLists(headerClone)
  processTeiAnnotations(headerClone)
  processHeaderElements(headerClone)
  return headerClone.outerHTML
}
export function hasTeiHeader(contentArea) {
  return !!contentArea.querySelector("[data-tag='teiheader']")
}
function removeLists(headerElement) {
  const listSelectors = [
    '[data-tag="listperson"]',
    '[data-tag="listplace"]',
    '[data-tag="listorg"]',
    '[data-tag="listbibl"]',
    '[data-tag="listevent"]',
    '[data-tag="list"]',
    '[data-tag="taxonomy"]',
    '[data-tag="classdecl"]',
    '[data-tag="keywords"]'
  ]
  listSelectors.forEach((selector) => {
    const elements = headerElement.querySelectorAll(selector)
    elements.forEach((el) => el.remove())
  })
}
function processHeaderElements(headerElement) {
  headerElement.classList.add('tei-header-display')
  processBlockElements(headerElement)
  processInlineElements(headerElement)
}
function processBlockElements(headerElement) {
  const blockElements = [
    'filedesc',
    'titlestmt',
    'publicationstmt',
    'sourcedesc',
    'profiledesc',
    'revisiondesc',
    'encodingdesc',
    'seriesstmt',
    'notesstmt',
    'respstmt',
    'biblstruct',
    'monogr',
    'imprint'
  ]
  blockElements.forEach((tagName) => {
    const elements = headerElement.querySelectorAll(`[data-tag="${tagName}"]`)
    elements.forEach((el) => {
      el.classList.add('tei-header-block')
      if (!el.querySelector('.tei-header-label')) {
        const label = createLabel(tagName)
        if (label) {
          el.insertAdjacentHTML('afterbegin', `<div class="tei-header-label">${label}</div>`)
        }
      }
    })
  })
}
function processInlineElements(headerElement) {
  const inlineElements = [
    'title',
    'author',
    'editor',
    'publisher',
    'date',
    'pubplace',
    'licence',
    'resp',
    'name',
    'persname',
    'orgname',
    'placename'
  ]
  inlineElements.forEach((tagName) => {
    const elements = headerElement.querySelectorAll(`[data-tag="${tagName}"]`)
    elements.forEach((el) => {
      el.classList.add('tei-header-inline')
      el.classList.add(`tei-header-${tagName}`)
    })
  })
}
function createLabel(tagName) {
  const labels = {
    filedesc: 'Descrizione del File',
    titlestmt: 'Informazioni sul Titolo',
    publicationstmt: 'Informazioni sulla Pubblicazione',
    sourcedesc: 'Descrizione della Fonte',
    profiledesc: 'Profilo del Documento',
    revisiondesc: 'Storia delle Revisioni',
    encodingdesc: 'Descrizione della Codifica',
    seriesstmt: 'Informazioni sulla Serie',
    notesstmt: 'Note',
    respstmt: 'Responsabilità',
    biblstruct: 'Struttura Bibliografica',
    monogr: 'Monografia',
    imprint: 'Informazioni Editoriali'
  }
  return labels[tagName] || ''
}
export function extractBasicMetadata(contentArea) {
  const teiHeaderElement = contentArea.querySelector('[data-tag="teiheader"]')
  if (!teiHeaderElement) {
    return {}
  }
  const metadata = {}
  const titleEl = teiHeaderElement.querySelector('[data-tag="title"]')
  if (titleEl) {
    metadata.title = titleEl.textContent.trim()
  }
  const authorEl = teiHeaderElement.querySelector('[data-tag="author"], [data-tag="persname"]')
  if (authorEl) {
    metadata.author = authorEl.textContent.trim()
  }
  const dateEl = teiHeaderElement.querySelector('[data-tag="date"]')
  if (dateEl) {
    metadata.date = dateEl.dataset.when || dateEl.textContent.trim()
  }
  const publisherEl = teiHeaderElement.querySelector('[data-tag="publisher"]')
  if (publisherEl) {
    metadata.publisher = publisherEl.textContent.trim()
  }
  return metadata
}
