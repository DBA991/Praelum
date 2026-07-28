<script setup>
import { computed } from 'vue'

const props = defineProps({
  documents: { type: Array, default: () => [] },
  ok: { type: Boolean, default: false },
  error: { type: String, default: null },
  validating: { type: Boolean, default: false },
  duplicateUuids: { type: Array, default: () => [] }
})

function folderName(path) {
  return path
    .replace(/[/\\]+$/, '')
    .split(/[/\\]/)
    .pop()
}

const hasDuplicates = computed(() => props.duplicateUuids.length > 0)
const hasDocuments = computed(() => props.documents.length > 0)
</script>

<template>
  <div class="validation-panel">
    <div v-if="!hasDocuments && !validating" class="status-box empty">
      <span class="status-icon">⚬</span> In attesa di tomi da esaminare...
    </div>

    <div v-else-if="validating" class="status-box loading">
      <span class="spinner">✍</span> Il redattore sta esaminando le carte…
    </div>

    <div v-else-if="ok" class="status-box success">
      <span class="status-icon">✓</span> L'opera è integra e pronta per la stampa.
    </div>

    <div v-else-if="error" class="status-box error">
      <span class="status-icon">✗</span> {{ error }}
    </div>

    <div v-if="hasDuplicates" class="duplicates-box">
      <p class="duplicates-title">Attenzione: Sigle in conflitto</p>
      <div v-for="dup in duplicateUuids" :key="dup.uuid" class="duplicate-entry">
        <span class="dup-uuid">{{ dup.uuid }}</span>
        <span class="dup-owners">
          rinvenuto in: {{ dup.owners.map((o) => folderName(o.folderPath)).join(' e ') }}
        </span>
      </div>
      <p class="duplicates-hint">
        Emendare le carte in conflitto prima di procedere, affinché non si sovrascrivano a vicenda.
      </p>
    </div>

    <div v-if="documents.length > 0" class="details">
      <div
        v-for="doc in documents"
        :key="doc.fileName"
        class="doc-validation"
        :class="{ 'has-errors': doc.errors.length > 0 }"
      >
        <div class="doc-name">{{ doc.title || doc.fileName }}</div>

        <div v-if="doc.errors.length > 0" class="messages errors">
          <div v-for="err in doc.errors" :key="err" class="msg error-msg">✗ {{ err }}</div>
        </div>

        <div v-if="doc.warnings.length > 0" class="messages warnings">
          <div v-for="warn in doc.warnings" :key="warn" class="msg warn-msg">⚠ {{ warn }}</div>
        </div>

        <div v-if="doc.errors.length === 0 && doc.warnings.length === 0" class="messages">
          <div class="msg ok-msg">✓ Opera senza macchia</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-box {
  padding: 1rem;
  border: 1px solid var(--ink-200);
  background: var(--paper-000);
  font-family: var(--font-display);
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.status-box.empty {
  color: var(--ink-500);
  justify-content: center;
  border-style: dashed;
}

.status-box.success {
  border-color: var(--ink-300);
  color: var(--ink-900);
}

.status-box.error {
  border-color: var(--rubric-700);
  color: var(--rubric-700);
}

.status-icon {
  font-style: normal;
  font-size: 1.2rem;
}

.duplicates-box {
  border: 1px solid var(--rubric-700);
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: transparent;
}

.duplicates-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  text-transform: uppercase;
  color: var(--rubric-700);
  margin: 0 0 0.75rem 0;
}

.duplicate-entry {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0;
  border-bottom: 1px dotted var(--rubric-700);
}

.duplicate-entry:last-of-type {
  border-bottom: none;
}

.dup-uuid {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--rubric-700);
}

.dup-owners {
  font-size: 0.85rem;
  color: var(--ink-700);
  font-style: italic;
}

.duplicates-hint {
  font-size: 0.85rem;
  color: var(--rubric-700);
  margin-top: 1rem;
  font-style: italic;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doc-validation {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ink-200);
}

.doc-validation.has-errors .doc-name {
  color: var(--rubric-700);
}

.doc-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--ink-900);
  margin-bottom: 0.4rem;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-left: 1rem;
}

.msg {
  font-size: 0.85rem;
  font-style: italic;
}

.error-msg {
  color: var(--rubric-700);
}

.warn-msg {
  color: var(--gold-600);
}

.ok-msg {
  color: var(--ink-500);
}
</style>
