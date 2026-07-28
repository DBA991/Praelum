<script setup>
import { computed } from 'vue'

const props = defineProps({
  folderResults: { type: Array, default: () => [] }
})

const totalCount = computed(() =>
  props.folderResults.reduce((sum, f) => sum + f.documents.length, 0)
)

function folderName(path) {
  return path
    .replace(/[/\\]+$/, '')
    .split(/[/\\]/)
    .pop()
}
</script>

<template>
  <div class="document-list">
    <div v-if="totalCount === 0" class="empty">
      <p>Nessun volume presente in archivio.</p>
    </div>

    <div v-else class="folder-groups">
      <div v-for="group in folderResults" :key="group.folderPath" class="folder-group">
        <h3 class="folder-group-label" :title="group.folderPath">
          {{ folderName(group.folderPath) }}
          <span class="folder-group-count">({{ group.documents.length }})</span>
        </h3>

        <ul class="doc-list">
          <li v-for="doc in group.documents" :key="doc.fileName" class="doc-item">
            <div class="doc-main">
              <span class="doc-title">{{ doc.title || doc.name || doc.uuid }}</span>
              <span class="leader"></span>
              <span class="format-badge">{{ doc.format }}</span>
            </div>

            <div class="doc-sub">
              <span class="uuid-text" :title="doc.uuid">Sigla: {{ doc.uuid.slice(0, 8) }}…</span>
              <div class="doc-files">
                <span :class="['file-tag', { found: doc.files.json }]">JSON</span>
                <span :class="['file-tag', { found: doc.files.html }]">HTML</span>
                <span :class="['file-tag', { found: doc.files.pdf }]">PDF</span>
                <span :class="['file-tag', { found: doc.files.xml }]">XML</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty p {
  color: var(--ink-500);
  text-align: center;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.1rem;
}

.folder-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.folder-group-label {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--ink-900);
  font-weight: normal;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.folder-group-count {
  color: var(--ink-500);
  font-size: 1rem;
  font-style: italic;
}

.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.doc-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.doc-main {
  display: flex;
  align-items: baseline;
  width: 100%;
}

.doc-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--ink-900);
}

.leader {
  flex: 1;
  border-bottom: 1px dotted var(--ink-300);
  margin: 0 0.5rem;
  position: relative;
  top: -4px;
}

.format-badge {
  font-family: var(--font-display);
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--rubric-700);
}

.doc-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0.5rem;
}

.uuid-text {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--ink-500);
}

.doc-files {
  display: flex;
  gap: 0.4rem;
}

.file-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-300);
}

.file-tag.found {
  color: var(--ink-900);
  font-weight: bold;
}
</style>
