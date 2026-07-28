<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeNote: {
    type: String,
    default: ''
  },

  activeNoteIsTei: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const noteTitle = computed(() => (props.activeNoteIsTei ? 'Dettagli' : 'Nota'))
</script>

<template>
  <div class="viewer-note-display">
    <template v-if="activeNote">
      <div class="note-header">
        <h4>{{ noteTitle }}</h4>
        <button @click="$emit('close')" class="close-note-button" aria-label="Chiudi">✕</button>
      </div>
      <div class="note-content">
        <span v-html="activeNote"></span>
      </div>
    </template>
    <template v-else>
      <span class="note-empty-state">
        Nessuna nota selezionata. Clicca su un simbolo di nota o una voce nell'elenco per
        visualizzarla.
      </span>
    </template>
  </div>
</template>

<style scoped>
.viewer-note-display {
  background: #fafafa;
  padding: 0.75rem;
  border-top: 1px solid #ccc;

  max-height: 10%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
  z-index: 4;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-right: 5px;
}

.note-header h4 {
  margin: 0;
  color: #555;
  font-size: 1em;
}

.close-note-button {
  background: none;
  border: none;
  color: #888;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-note-button:hover {
  color: #333;
}

.note-content {
  flex: 1;
}

.note-content :deep(pre) {
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #e9ecef;
  padding: 8px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.85em;
  color: #495057;
  margin-top: 10px;
}

.note-content :deep(strong) {
  margin-bottom: 0.5rem;
  color: #555;
}

.note-content :deep(.metadata-display) {
  margin-top: 10px;
}

.note-content :deep(.metadata-display p) {
  margin: 5px 0;
  font-size: 0.9em;
}

.note-content :deep(.metadata-display strong) {
  color: #007bff;
}

.note-empty-state {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9em;
}
</style>
