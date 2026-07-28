<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  logs: { type: Array, default: () => [] }
})

const logContainer = ref(null)

watch(
  () => props.logs.length,
  async () => {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
)
</script>

<template>
  <div class="build-log">
    <div v-if="logs.length === 0" class="empty">Le cronache tacciono, in attesa di eventi.</div>

    <div v-else ref="logContainer" class="log-container">
      <div v-for="(entry, i) in logs" :key="i" class="log-line">
        <span class="log-text">{{ entry.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty {
  color: var(--ink-500);
  text-align: center;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1rem;
  padding: 1rem;
}

.log-container {
  background: var(--paper-100);
  border: 1px solid var(--ink-200);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.6;
}

.log-line {
  color: var(--ink-700);
  white-space: pre-wrap;
  word-break: break-all;
  border-bottom: 1px dashed var(--ink-200);
  padding-bottom: 0.2rem;
  margin-bottom: 0.2rem;
}

.log-line:last-child {
  border-bottom: none;
}

.log-text {
  color: var(--ink-900);
}

.log-line:has(.log-text:empty) {
  display: none;
}
</style>
