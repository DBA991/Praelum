<script setup>
defineProps({
  sourceFolders: { type: Array, default: () => [] },
  outputPath: { type: String, default: null },
  canBuild: { type: Boolean, default: false },
  building: { type: Boolean, default: false },
  buildSuccess: { type: Boolean, default: null },
  buildError: { type: String, default: null },
  buildOutputPath: { type: String, default: null },
  htmlDocCount: { type: Number, default: 0 },
  previewOpening: { type: Boolean, default: false },
  validating: { type: Boolean, default: false },
  validationOk: { type: Boolean, default: false }
})

const emit = defineEmits(['select-output', 'build', 'open-output', 'open-preview', 'reset'])
</script>

<template>
  <div class="build-controls">
    <div v-if="!building && buildSuccess === null" class="output-section">
      <div class="output-row">
        <label class="output-label">Archivio di Destinazione:</label>
        <button
          class="btn btn-outline"
          :disabled="sourceFolders.length === 0"
          @click="emit('select-output')"
        >
          Destina…
        </button>
      </div>
      <div v-if="outputPath" class="output-path">{{ outputPath }}</div>
    </div>

    <div v-if="!building && buildSuccess === null" class="build-action">
      <button class="btn btn-primary" :disabled="!canBuild" @click="emit('build')">
        Imprimi il Volume
      </button>

      <p v-if="sourceFolders.length === 0" class="build-hint">Richiede tomi da pubblicare.</p>
      <p v-else-if="validating" class="build-hint">Esame delle carte in corso…</p>
      <p v-else-if="!validationOk" class="build-hint">
        Necessario correggere gli errori di collazione prim'ancora di stampare.
      </p>
      <p v-else-if="!canBuild" class="build-hint">
        Designa un luogo di destinazione per le stampe.
      </p>
      <p v-else-if="htmlDocCount > 0" class="build-info">
        Saranno impresse {{ htmlDocCount }} pagina{{ htmlDocCount === 1 ? '' : 'e' }} tratte da
        {{ sourceFolders.length }} fascicol{{ sourceFolders.length === 1 ? 'o' : 'i' }}.
      </p>
    </div>

    <div v-if="building" class="build-status">
      <span class="spinner">⚙</span>
      <span>Il torchio è in funzione…</span>
    </div>

    <div v-if="buildSuccess === true" class="build-result success">
      <span class="result-icon">❦</span>
      <span class="result-title">Opera Impressa con Successo</span>
      <div class="result-actions">
        <button class="btn btn-primary" :disabled="previewOpening" @click="emit('open-preview')">
          {{ previewOpening ? 'Dischiudendo…' : "Esamina l'Opera" }}
        </button>
        <button class="btn btn-outline" @click="emit('open-output')">Rivela nel sistema</button>
        <button class="btn btn-outline" @click="emit('reset')">Nuova impressione</button>
      </div>
    </div>

    <div v-if="buildSuccess === false && buildError" class="build-result failure">
      <span class="result-icon">✗</span>
      <span class="result-title">Impressione Fallita</span>
      <p class="error-text">{{ buildError }}</p>
      <button class="btn btn-outline" @click="emit('reset')">Tenta nuovamente</button>
    </div>
  </div>
</template>

<style scoped>
.output-section {
  margin-bottom: 1.5rem;
}

.output-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.output-label {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--ink-900);
}

.output-path {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-700);
  word-break: break-all;
  padding: 0.5rem;
  border: 1px dashed var(--ink-300);
  background: var(--paper-100);
}

.build-action {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--ink-200);
}

.build-hint {
  font-style: italic;
  font-size: 0.9rem;
  color: var(--ink-500);
  margin: 1rem 0 0;
}

.build-info {
  font-style: italic;
  font-size: 0.9rem;
  color: var(--ink-900);
  margin: 1rem 0 0;
}

.build-status {
  text-align: center;
  padding: 2rem;
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--ink-900);
  font-style: italic;
}

.build-result {
  text-align: center;
  padding: 1.5rem;
  border: 1px solid var(--ink-200);
  background: var(--paper-100);
}

.result-title {
  display: block;
  font-family: var(--font-display);
  font-size: 1.25rem;
  margin: 0.5rem 0 1.5rem 0;
}

.build-result.success .result-title,
.build-result.success .result-icon {
  color: var(--ink-900);
}

.build-result.failure .result-title,
.build-result.failure .result-icon {
  color: var(--rubric-700);
}

.result-icon {
  font-size: 2rem;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.error-text {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--rubric-700);
  word-break: break-all;
  margin-bottom: 1.5rem;
}

.btn {
  border-radius: 2px;
  padding: 0.6rem 1.5rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--ink-900);
  color: var(--paper-000);
  border: 1px solid var(--ink-900);
}

.btn-primary:hover:not(:disabled) {
  background: var(--rubric-700);
  border-color: var(--rubric-700);
}

.btn-outline {
  background: transparent;
  color: var(--ink-900);
  border: 1px solid var(--ink-500);
}

.btn-outline:hover:not(:disabled) {
  border-color: var(--ink-900);
  background: var(--paper-000);
}
</style>
