<script setup>
import { ref } from 'vue'

const props = defineProps({
  folders: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'add-paths', 'remove'])

const dragOver = ref(false)

function handleClick() {
  if (!props.disabled) {
    emit('add')
  }
}

function onDragOver(e) {
  e.preventDefault()
  if (!props.disabled) dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e) {
  e.preventDefault()
  dragOver.value = false
  if (props.disabled) return
  const files = e.dataTransfer.files
  if (files.length === 0) return

  const paths = Array.from(files)
    .map((f) => window.api?.getPathForFile(f))
    .filter(Boolean)

  if (paths.length > 0) {
    emit('add-paths', paths)
  }
}

function folderName(path) {
  return path
    .replace(/[/\\]+$/, '')
    .split(/[/\\]/)
    .pop()
}

function toRoman(num) {
  const roman = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  }
  let str = ''
  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i])
    num -= q * roman[i]
    str += i.repeat(q)
  }
  return str
}
</script>

<template>
  <div class="folder-selector">
    <div v-if="folders.length > 0" class="fascicoli">
      <ol class="folder-list">
        <li v-for="(path, i) in folders" :key="path" class="folder-item">
          <span class="folder-index">{{ toRoman(i + 1) }}.</span>
          <span class="folder-name" :title="path">{{ folderName(path) }}</span>
          <span class="folder-path-full" :title="path">{{ path }}</span>
          <button
            class="remove-btn"
            type="button"
            :disabled="disabled"
            title="Rimuovi questo fascicolo"
            @click="emit('remove', path)"
          >
            ✕
          </button>
        </li>
      </ol>
    </div>

    <div
      class="dropzone"
      :class="{ 'drag-over': dragOver, disabled, compact: folders.length > 0 }"
      role="button"
      tabindex="0"
      @click="handleClick"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @keydown.enter="handleClick"
    >
      <div class="dropzone-inner">
        <span class="dropzone-icon" aria-hidden="true">❧</span>
        <span class="dropzone-label">
          {{
            folders.length > 0
              ? 'Aggiungi un altro fascicolo'
              : 'Immetti qui le cartelle dei fascicoli'
          }}
        </span>
        <span class="dropzone-hint">Fai clic oppure trascina i tomi all'interno</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.folder-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 0.85rem;
  padding: 0.5rem 0;
  border-bottom: 1px dotted var(--ink-300);
}

.folder-index {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--rubric-700);
  min-width: 1.5rem;
}

.folder-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--ink-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  grid-row: 1;
}

.folder-path-full {
  display: none;
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--ink-300);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem;
  transition: all 0.2s ease;
}

.remove-btn:hover:not(:disabled) {
  color: var(--rubric-700);
}

.remove-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dropzone {
  border: 1px solid var(--ink-200);
  padding: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--paper-000);
}

.dropzone-inner {
  border: 1px solid var(--ink-200);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.dropzone.compact .dropzone-inner {
  padding: 1rem 1.25rem;
}

.dropzone:hover:not(.disabled) .dropzone-inner,
.dropzone.drag-over .dropzone-inner {
  border-color: var(--rubric-700);
}

.dropzone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropzone-icon {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--gold-600);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.dropzone-label {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--ink-900);
}

.dropzone-hint {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--ink-500);
}
</style>
