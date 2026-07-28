<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { createPdfAdapter } from './pdf-viewer/PdfAdapter.js'

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  },

  showToolbar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['page-change', 'loaded'])

const containerEl = ref(null)

const adapter = shallowRef(null)

const currentPage = ref(1)
const totalPages = ref(0)
const zoomLevel = ref(100)
const isLoading = ref(true)
const errorMsg = ref('')

let unsubPageChange = null

onMounted(async () => {
  if (!containerEl.value) return
  try {
    const a = await createPdfAdapter(containerEl.value)
    adapter.value = a

    unsubPageChange = a.onPageChange((page, total) => {
      currentPage.value = page
      totalPages.value = total

      emit('page-change', page)
    })

    await a.load(props.pdfUrl)
    totalPages.value = a.numPages
    currentPage.value = a.currentPage
    zoomLevel.value = Math.round(a.zoom * 100)
    isLoading.value = false
    emit('loaded', { pages: a.numPages })
  } catch (err) {
    console.error('PdfViewer: caricamento fallito', err)
    errorMsg.value = 'Impossibile caricare il documento PDF.'
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (unsubPageChange) unsubPageChange()
  if (adapter.value) adapter.value.destroy()
})

const nextPage = () => {
  if (adapter.value) adapter.value.goToPage(currentPage.value + 1)
}

const prevPage = () => {
  if (adapter.value) adapter.value.goToPage(currentPage.value - 1)
}

const zoomIn = async () => {
  if (!adapter.value) return
  await adapter.value.zoomIn()
  zoomLevel.value = Math.round(adapter.value.zoom * 100)
}

const zoomOut = async () => {
  if (!adapter.value) return
  await adapter.value.zoomOut()
  zoomLevel.value = Math.round(adapter.value.zoom * 100)
}

const zoomFit = async () => {
  if (!adapter.value) return
  await adapter.value.setZoom('fit')
  zoomLevel.value = Math.round(adapter.value.zoom * 100)
}

const goToPage = (n) => {
  adapter.value?.goToPage(Number(n))
}

defineExpose({ goToPage })
</script>

<template>
  <div class="pdf-viewer">
    <div v-if="showToolbar" class="pdf-toolbar">
      <div class="page-nav">
        <button @click="prevPage" :disabled="currentPage <= 1" title="Pagina precedente">◀</button>
        <span class="page-counter">
          <input
            v-model.number.lazy="currentPage"
            @change="goToPage(currentPage)"
            type="number"
            min="1"
            :max="totalPages"
            class="page-input"
            :aria-label="`Pagina ${currentPage} di ${totalPages}`"
          />
          <span class="page-total">/ {{ totalPages }}</span>
        </span>
        <button @click="nextPage" :disabled="currentPage >= totalPages" title="Pagina successiva">
          ▶
        </button>
      </div>

      <div class="zoom-controls">
        <button @click="zoomOut" :disabled="zoomLevel <= 25" title="Zoom indietro">−</button>
        <span class="zoom-level">{{ zoomLevel }}%</span>
        <button @click="zoomIn" :disabled="zoomLevel >= 500" title="Zoom avanti">+</button>
        <button @click="zoomFit" title="Adatta alla larghezza" class="fit-btn">⤢</button>
      </div>
    </div>

    <div class="pdf-scroll" :class="{ 'no-toolbar': !showToolbar }">
      <div v-if="isLoading" class="pdf-status">Caricamento documento…</div>
      <div v-else-if="errorMsg" class="pdf-status pdf-error">{{ errorMsg }}</div>
      <!-- Il container verrà popolato dall'adapter con il canvas della pagina. -->
      <div ref="containerEl" class="pdf-canvas-container"></div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #525659;
}

.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #3b3e40;
  color: #f1f1f1;
  flex-shrink: 0;
  border-bottom: 1px solid #2a2c2d;
}

.pdf-toolbar button {
  background: #4d5154;
  color: #f1f1f1;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.15s ease;
}

.pdf-toolbar button:hover:not(:disabled) {
  background: #616467;
}

.pdf-toolbar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-nav,
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.page-counter {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.page-input {
  width: 3rem;
  padding: 2px 4px;
  background: #2a2c2d;
  color: #f1f1f1;
  border: 1px solid #616467;
  border-radius: 3px;
  font-size: 0.85em;
  text-align: center;
}

.page-total {
  font-size: 0.85em;
  color: #c7c9ca;
}

.zoom-level {
  font-size: 0.85em;
  min-width: 3rem;
  text-align: center;
  color: #c7c9ca;
}

.fit-btn {
  font-size: 1em !important;
}

.pdf-scroll {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-scroll.no-toolbar {
  height: 100%;
}

.pdf-canvas-container {
  display: flex;
  justify-content: center;
}

.pdf-canvas-container :deep(.pdf-page-canvas) {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  max-width: none;
}

.pdf-status {
  color: #f1f1f1;
  font-style: italic;
  padding: 2rem;
}

.pdf-error {
  color: #ff8a80;
}
</style>
