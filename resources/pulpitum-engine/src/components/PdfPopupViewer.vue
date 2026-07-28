<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import PdfViewer from './PdfViewer.vue'
import { createSync } from '../lib/sync.js'

const props = defineProps({
  uuid: { type: String, required: true },
  pdfUrl: { type: String, default: '' }
})

const PDF_SOURCE = 'pdf'

let sync = null
let unsub = null
let viewer = null

const setViewer = (el) => {
  viewer = el
}

onMounted(() => {
  sync = createSync(props.uuid)

  unsub = sync.onPageChange((page, source) => {
    if (source === PDF_SOURCE) return
    viewer?.goToPage(page)
  })
})

onBeforeUnmount(() => {
  if (unsub) unsub()
})

const onPageChange = (page) => {
  sync?.gotoPage(page, PDF_SOURCE)
}
</script>

<template>
  <div class="pdf-popup">
    <PdfViewer ref="setViewer" :pdf-url="pdfUrl" :show-toolbar="true" @page-change="onPageChange" />
  </div>
</template>

<style scoped>
.pdf-popup {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
