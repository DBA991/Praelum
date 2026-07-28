<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import HtmlViewer from './html-viewer/HtmlViewer.vue'
import { createSync } from '../lib/sync.js'

const props = defineProps({
  uuid: { type: String, required: true },
  htmlContent: { type: String, default: '' }
})

const HTML_SOURCE = 'html'

let sync = null
let unsub = null

let viewer = null

const setViewer = (el) => {
  viewer = el
}

onMounted(() => {
  sync = createSync(props.uuid)

  unsub = sync.onPageChange((page, source) => {
    if (source === HTML_SOURCE) return
    viewer?.goToPage(page)
  })
})

onBeforeUnmount(() => {
  if (unsub) unsub()
})

const onPageChange = (pageN) => {
  const n = Number(pageN)
  if (Number.isFinite(n)) {
    sync?.gotoPage(n, HTML_SOURCE)
  }
}
</script>

<template>
  <div class="html-popup">
    <HtmlViewer ref="setViewer" :html-content="htmlContent" @page-change="onPageChange" />
  </div>
</template>

<style scoped>
.html-popup {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
