<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HtmlViewer from './html-viewer/HtmlViewer.vue'
import PdfViewer from './PdfViewer.vue'
import SynchronizationControls from './SynchronizationControls.vue'
import { createSync } from '../lib/sync.js'

const props = defineProps({
  htmlContent: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  htmlUrl: { type: String, default: '' },
  xmlUrl: { type: String, default: '' },
  uuid: { type: String, required: true },
  title: { type: String, default: 'Documento' },
  language: { type: String, default: '' }
})

const HTML_SOURCE = 'html'
const PDF_SOURCE = 'pdf'

const TOOLBAR_SOURCE = 'toolbar'

const MOBILE_BREAKPOINT = 992
const isMobile = ref(false)
let mobileMediaQuery = null

const activeView = ref('html')

const htmlViewerRef = ref(null)
const pdfViewerRef = ref(null)

const sync = createSync(props.uuid)

const currentPage = ref(1)
const totalPages = ref(0)

let lastSource = null

let unsubPageChange = null

const MIN_PANEL_PERCENT = 25
const MAX_PANEL_PERCENT = 75
const htmlPanelPercent = ref(50)
const splitPanelsEl = ref(null)
const isDragging = ref(false)

const startDrag = (event) => {
  if (event.type === 'mousedown' && event.button !== 0) return
  isDragging.value = true
  event.preventDefault()
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('touchend', stopDrag)
}

const onDrag = (event) => {
  if (!isDragging.value || !splitPanelsEl.value) return
  event.preventDefault()
  const rect = splitPanelsEl.value.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const rawPercent = ((clientX - rect.left) / rect.width) * 100
  htmlPanelPercent.value = Math.min(MAX_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, rawPercent))
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

const onMobileChange = (event) => {
  isMobile.value = event.matches
}

onMounted(() => {
  unsubPageChange = sync.onPageChange((page, source) => {
    currentPage.value = page

    if (source === HTML_SOURCE) {
      pdfViewerRef.value?.goToPage(page)
    } else if (source === PDF_SOURCE) {
      htmlViewerRef.value?.goToPage(page)
    } else {
      if (lastSource !== HTML_SOURCE) htmlViewerRef.value?.goToPage(page)
      if (lastSource !== PDF_SOURCE) pdfViewerRef.value?.goToPage(page)
    }
    lastSource = source
  })

  mobileMediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  isMobile.value = mobileMediaQuery.matches
  mobileMediaQuery.addEventListener('change', onMobileChange)
})

onBeforeUnmount(() => {
  if (unsubPageChange) unsubPageChange()
  stopDrag()
  if (mobileMediaQuery) {
    mobileMediaQuery.removeEventListener('change', onMobileChange)
    mobileMediaQuery = null
  }
})

const onHtmlPageChange = (pageN) => {
  const n = Number(pageN)
  if (Number.isFinite(n)) {
    sync.gotoPage(n, HTML_SOURCE)
  } else {
  }
}

const onPdfPageChange = (page) => {
  sync.gotoPage(page, PDF_SOURCE)
}

const onPdfLoaded = ({ pages }) => {
  totalPages.value = pages
}

const onPrevPage = () => {
  const target = currentPage.value - 1
  if (target < 1) return
  sync.gotoPage(target, TOOLBAR_SOURCE)
}

const onNextPage = () => {
  const target = currentPage.value + 1
  if (totalPages.value > 0 && target > totalPages.value) return
  sync.gotoPage(target, TOOLBAR_SOURCE)
}

const onToggleView = () => {
  activeView.value = activeView.value === 'html' ? 'pdf' : 'html'
}
</script>

<template>
  <div class="document-viewer" :class="{ 'mobile-mode': isMobile }">
    <SynchronizationControls
      :current-page="currentPage"
      :total-pages="totalPages"
      :title="title"
      :language="language"
      :html-url="htmlUrl"
      :pdf-url="pdfUrl"
      :xml-url="xmlUrl"
      :uuid="uuid"
      :is-mobile="isMobile"
      :active-view="activeView"
      @prev-page="onPrevPage"
      @next-page="onNextPage"
      @toggle-view="onToggleView"
    />

    <div
      class="split-panels"
      ref="splitPanelsEl"
      :class="{ dragging: isDragging, 'mobile-mode': isMobile }"
    >
      <section
        class="panel panel-html"
        :class="{ 'panel-hidden': isMobile && activeView !== 'html' }"
        aria-label="Testo del documento"
        :style="isMobile ? {} : { width: htmlPanelPercent + '%' }"
      >
        <HtmlViewer
          ref="htmlViewerRef"
          :html-content="htmlContent"
          @page-change="onHtmlPageChange"
        />
      </section>

      <div
        v-if="!isMobile"
        class="panel-divider"
        role="separator"
        aria-orientation="vertical"
        aria-label="Ridimensiona i pannelli Testo e Documento"
        tabindex="0"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @keydown.left="htmlPanelPercent = Math.max(MIN_PANEL_PERCENT, htmlPanelPercent - 5)"
        @keydown.right="htmlPanelPercent = Math.min(MAX_PANEL_PERCENT, htmlPanelPercent + 5)"
      ></div>

      <section
        class="panel panel-pdf"
        :class="{ 'panel-hidden': isMobile && activeView !== 'pdf' }"
        aria-label="Documento PDF"
        :style="isMobile ? {} : { width: 100 - htmlPanelPercent + '%' }"
      >
        <PdfViewer
          ref="pdfViewerRef"
          :pdf-url="pdfUrl"
          @page-change="onPdfPageChange"
          @loaded="onPdfLoaded"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.document-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.split-panels {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.panel {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-width: 0;
}

.panel-html {
  background: #f8f9fa;
}

.panel-pdf {
  background: #525659;
}

.panel-divider {
  width: 6px;
  background: #1a252f;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.panel-divider:hover,
.panel-divider:focus-visible {
  background: #2980b9;
  outline: none;
}

.split-panels.dragging {
  cursor: col-resize;
  user-select: none;
}

.split-panels.dragging .panel-divider {
  background: #2980b9;
}

.split-panels.dragging :deep(iframe),
.split-panels.dragging :deep(canvas) {
  pointer-events: none;
}

.panel-label {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  padding: 2px 10px;
  border-radius: 10px;
  pointer-events: none;
}

.split-panels.mobile-mode .panel {
  width: 100% !important;
  flex: 1 1 auto;
}

.panel-hidden {
  display: none !important;
}

@media (max-width: 992px) {
  .split-panels {
    flex-direction: column;
  }

  .panel-divider {
    width: 100%;
    height: 4px;
    cursor: row-resize;
  }
}
</style>
