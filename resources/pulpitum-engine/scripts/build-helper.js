#!/usr/bin/env node
import { mkdir, writeFile, readFile, readdir, access, cp, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const JSON_DIR = join(ROOT, 'json')
const REPO_DIR = join(ROOT, 'repo')
const HTML_DIR = join(REPO_DIR, 'html')
const PDF_DIR = join(REPO_DIR, 'pdf')
const XML_DIR = join(REPO_DIR, 'xml')
const PUBLIC_DIR = join(ROOT, 'public')
const cmd = process.argv[2] || ''
async function ensureDirs() {
  await mkdir(JSON_DIR, {
    recursive: true
  })
  await mkdir(HTML_DIR, {
    recursive: true
  })
  await mkdir(PDF_DIR, {
    recursive: true
  })
  await mkdir(XML_DIR, {
    recursive: true
  })
}
async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}
function buildTeiHtml() {
  const el = (tag, attrs, ...children) => {
    const dataAttrs = Object.entries(attrs || {})
      .map(([k, v]) => `data-${k}="${v}"`)
      .join(' ')
    return `<span class="tei-${tag}" data-tag="${tag}"${dataAttrs ? ' ' + dataAttrs : ''}>${children.join('')}</span> `
  }
  const pb = (n) =>
    el('pb', {
      n: String(n),
      id: `fedro-pb-${n}`
    })
  const p = (id, ...children) =>
    el(
      'p',
      {
        id
      },
      ...children
    )
  const text = (t) => t
  const header = el(
    'teiheader',
    null,
    el(
      'filedesc',
      null,
      el(
        'titlestmt',
        null,
        el('title', null, text('Fedro - Commento al fedro platonico')),
        el('author', null, text('Anonimo (esempio didattico)'))
      ),
      el(
        'publicationstmt',
        null,
        el('publisher', null, text('Delta2Studio')),
        el('pubplace', null, text('Italia')),
        el(
          'date',
          {
            when: '2026'
          },
          text('2026')
        )
      )
    ),
    el(
      'sourcedesc',
      null,
      el('p', null, text('Documento di esempio generato da Pulpitum build-helper.'))
    )
  )
  const page1 = [
    pb(1),
    el('head', null, text('Commento al Fedro')),
    p(
      'fedro-p1-1',
      text('Il '),
      el(
        'persname',
        {
          ref: 'plato'
        },
        text('Platone')
      ),
      text(' nel Fedro discute della natura dell’anima e dell’amore. La dialettica, '),
      text('qui, si dispiega come ascesa verso le idee.'),
      el(
        'note',
        {
          type: 'glossa',
          resp: 'curatore'
        },
        text('Glossa: la dialettica platonica non è semplice ragionamento ma via alla verità.')
      )
    ),
    p(
      'fedro-p1-2',
      text('Socrate incontra '),
      el(
        'persname',
        {
          ref: 'phaedrus'
        },
        text('Fedro')
      ),
      text(' fuori dalle mura di Atene, lungo il fiume Ilisso.')
    )
  ]
  const page2 = [
    pb(2),
    el('head', null, text('Il mito del carro alato')),
    p(
      'fedro-p2-1',
      text('L’anima è paragonata a un carro trainato da due cavalli, uno bianco e uno nero, '),
      text('guidati da un auriga. Il cavallo bianco rappresenta la parte nobile, quello nero '),
      text('le passioni irrazionali.'),
      el(
        'note',
        {
          type: 'annotazione'
        },
        text('Immagine cara alla tradizione neoplatonica.')
      )
    )
  ]
  const page3 = [
    pb(3),
    el('head', null, text('La scrittura e la memoria')),
    p(
      'fedro-p3-1',
      text('Nel mito di Theuth, la scrittura è presentata come rimedio per la memoria, '),
      text('ma anche come possibile causa di oblio, perché affida al segno ciò che '),
      text('dovrebbe restare vivo nell’anima.')
    )
  ]
  return el('tei', null, header, ...page1, ...page2, ...page3)
}
function buildTeiXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Fedro - Commento al fedro platonico</title>
        <author>Anonimo (esempio didattico)</author>
      </titleStmt>
      <publicationStmt>
        <publisher>Delta2Studio</publisher>
        <pubPlace>Italia</pubPlace>
        <date when="2026">2026</date>
      </publicationStmt>
      <sourceDesc>
        <p>Documento di esempio generato da Pulpitum build-helper.</p>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
      <pb n="1" xml:id="fedro-pb-1"/>
      <head>Commento al Fedro</head>
      <p xml:id="fedro-p1-1">Il <persName ref="plato">Platone</persName> nel Fedro discute
        della natura dell'anima e dell'amore. La dialettica, qui, si dispiega come ascesa
        verso le idee.<note type="glossa" resp="curatore">Glossa: la dialettica platonica
        non è semplice ragionamento ma via alla verità.</note></p>
      <p xml:id="fedro-p1-2">Socrate incontra <persName ref="phaedrus">Fedro</persName>
        fuori dalle mura di Atene, lungo il fiume Ilisso.</p>
      <pb n="2" xml:id="fedro-pb-2"/>
      <head>Il mito del carro alato</head>
      <p xml:id="fedro-p2-1">L'anima è paragonata a un carro trainato da due cavalli,
        uno bianco e uno nero, guidati da un auriga.<note type="annotazione">Immagine
        cara alla tradizione neoplatonica.</note></p>
      <pb n="3" xml:id="fedro-pb-3"/>
      <head>La scrittura e la memoria</head>
      <p xml:id="fedro-p3-1">Nel mito di Theuth, la scrittura è presentata come rimedio
        per la memoria, ma anche come possibile causa di oblio.</p>
    </body>
  </text>
</TEI>
`
}
async function buildPdf(pages = 3) {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle('Fedro - Commento al fedro platonico')
  pdfDoc.setAuthor('Delta2Studio')
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const margin = 50
  for (let i = 1; i <= pages; i++) {
    const page = pdfDoc.addPage([595.28, 841.89])
    const { width, height } = page.getSize()
    page.drawText('Fedro — Commento', {
      x: margin,
      y: height - margin,
      size: 20,
      font,
      color: rgb(0.17, 0.24, 0.31)
    })
    page.drawText(`Pagina ${i}`, {
      x: width / 2 - 60,
      y: height / 2,
      size: 48,
      font,
      color: rgb(0.16, 0.5, 0.73)
    })
    const body = `Questa è la pagina ${i} del documento di esempio.`
    page.drawText(body, {
      x: margin,
      y: height / 2 - 60,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3)
    })
    page.drawText(`— ${i} —`, {
      x: width / 2 - 15,
      y: margin,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })
  }
  return pdfDoc.save()
}
async function generate() {
  await ensureDirs()
  const uuid = 'uuid1'
  const name = 'Fedro'
  const htmlContent = buildTeiHtml()
  const htmlPath = join(HTML_DIR, `${uuid}.${name}.html`)
  await writeFile(htmlPath, htmlContent, 'utf8')
  const xmlContent = buildTeiXml()
  const xmlPath = join(XML_DIR, `${uuid}.${name}.xml`)
  await writeFile(xmlPath, xmlContent, 'utf8')
  const pdfBytes = await buildPdf(3)
  const pdfPath = join(PDF_DIR, `${uuid}.${name}.pdf`)
  await writeFile(pdfPath, pdfBytes)
  const metadata = {
    uuid,
    title: 'Fedro Commentary',
    language: 'it',
    htmlPath: `/repo/html/${uuid}.${name}.html`,
    pdfPath: `/repo/pdf/${uuid}.${name}.pdf`,
    xmlPath: `/repo/xml/${uuid}.${name}.xml`
  }
  const jsonPath = join(JSON_DIR, `html.${uuid}.${name}.json`)
  await writeFile(jsonPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8')
  console.log('✓ Documento dummy generato:')
  console.log('  HTML →', htmlPath)
  console.log('  XML  →', xmlPath)
  console.log('  PDF  →', pdfPath)
  console.log('  JSON →', jsonPath)
}
async function validate() {
  let files = []
  try {
    files = await readdir(JSON_DIR)
  } catch {
    console.error('✗ Cartella /json non trovata. Esegui prima `generate`.')
    process.exit(1)
  }
  const jsonFiles = files.filter((f) => f.endsWith('.json'))
  if (jsonFiles.length === 0) {
    console.warn('⚠ Nessun JSON in /json.')
    return
  }
  let ok = true
  for (const f of jsonFiles) {
    const raw = await readFile(join(JSON_DIR, f), 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch (e) {
      console.error(`✗ ${f}: JSON non valido (${e.message})`)
      ok = false
      continue
    }
    const base = f.replace(/\.json$/, '')
    const format = base.split('.')[0]
    const checks = []
    if (format === 'html') {
      checks.push(['htmlPath', data.htmlPath], ['pdfPath', data.pdfPath], ['xmlPath', data.xmlPath])
    } else {
      checks.push(['pdfPath', data.pdfPath], ['xmlPath', data.xmlPath])
    }
    for (const [key, val] of checks) {
      if (!val) {
        console.error(`✗ ${f}: manca ${key}`)
        ok = false
        continue
      }
      const diskPath = join(ROOT, '.' + val)
      if (!(await exists(diskPath))) {
        console.error(`✗ ${f}: ${key}="${val}" non trovato in /repo`)
        ok = false
      }
    }
    if (!data.uuid) {
      console.warn(`⚠ ${f}: manca "uuid" nel JSON`)
    }
  }
  if (ok) {
    console.log(`✓ Validazione OK (${jsonFiles.length} JSON).`)
  } else {
    console.error('✗ Validazione FALLITA.')
    process.exit(1)
  }
}
async function syncPublic() {
  await rm(join(PUBLIC_DIR, 'repo'), {
    recursive: true,
    force: true
  })
  await rm(join(PUBLIC_DIR, 'json'), {
    recursive: true,
    force: true
  })
  await mkdir(join(PUBLIC_DIR, 'repo'), {
    recursive: true
  })
  await mkdir(join(PUBLIC_DIR, 'json'), {
    recursive: true
  })
  if (existsSync(REPO_DIR)) {
    await cp(REPO_DIR, join(PUBLIC_DIR, 'repo'), {
      recursive: true
    })
  }
  if (existsSync(JSON_DIR)) {
    await cp(JSON_DIR, join(PUBLIC_DIR, 'json'), {
      recursive: true
    })
  }
  console.log('✓ Sincronizzato /repo e /json in /public.')
}
switch (cmd) {
  case 'generate':
    await generate()
    break
  case 'validate':
    await validate()
    break
  case 'sync-public':
    await syncPublic()
    break
  default:
    console.log(`Usage: node scripts/build-helper.js <command>

Comandi:
  generate      genera documenti dummy (HTML/PDF/XML/JSON) in /repo e /json
  validate      verifica la coerenza tra i JSON e i file in /repo
  sync-public   copia /repo e /json in /public (serviti staticamente da Astro)
`)
    process.exit(cmd ? 1 : 0)
}
