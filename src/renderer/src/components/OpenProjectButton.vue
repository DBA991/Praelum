<script setup>
defineProps({
  hasLastBuild: { type: Boolean, default: false },
  opening: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const emit = defineEmits(['open-last', 'open-from-dialog'])
</script>

<template>
  <div class="open-project">
    <div class="open-project-row">
      <button
        v-if="hasLastBuild"
        class="btn btn-classic"
        :disabled="opening"
        @click="emit('open-last')"
      >
        {{ opening ? 'Apertura…' : 'Apri Progetto' }}
      </button>
      <button v-else class="btn btn-classic" :disabled="opening" @click="emit('open-from-dialog')">
        {{ opening ? 'Apertura…' : 'Apri Progetto' }}
      </button>

      <button
        v-if="hasLastBuild"
        class="btn btn-outline"
        :disabled="opening"
        title="Scegli una cartella diversa dall'ultimo sito generato"
        @click="emit('open-from-dialog')"
      >
        Sfoglia…
      </button>
    </div>

    <p v-if="error" class="open-project-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.open-project {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}

.open-project-row {
  display: flex;
  gap: 0.75rem;
}

.btn {
  border-radius: 2px;
  padding: 0.5rem 1.25rem;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-classic {
  background: var(--ink-900);
  color: var(--paper-000);
  border: 1px solid var(--ink-900);
}

.btn-classic:hover:not(:disabled) {
  background: var(--rubric-700);
  border-color: var(--rubric-700);
}

.btn-outline {
  background: transparent;
  color: var(--ink-700);
  border: 1px solid var(--ink-300);
}

.btn-outline:hover:not(:disabled) {
  background: var(--paper-100);
  border-color: var(--ink-700);
}

.open-project-error {
  font-size: 0.8rem;
  color: var(--rubric-700);
  font-style: italic;
  max-width: 260px;
  text-align: right;
  margin: 0;
}
</style>
