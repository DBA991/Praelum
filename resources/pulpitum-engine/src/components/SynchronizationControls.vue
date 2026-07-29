<script setup>

import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 0 },
  title: { type: String, default: '' },
  language: { type: String, default: '' },
  htmlUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  xmlUrl: { type: String, default: '' },
  uuid: { type: String, required: true },
  isMobile: { type: Boolean, default: false },
  activeView: { type: String, default: 'html' }
})

const emit = defineEmits(['prev-page', 'next-page', 'toggle-view'])


const popoutHtml = computed(() => `/view/html/${props.uuid}`)
const popoutPdf = computed(() => `/view/pdf/${props.uuid}`)
</script>

<template>
  <div class="sync-controls">
    <div class="sync-section sync-left">
      <a href="/" class="back-link" title="Ritorna alla biblioteca">
        <span class="rubric-mark">❧</span> Indice
      </a>
      <div class="doc-info" v-if="title">
        <h1 class="doc-title" :title="title">{{ title }}</h1>
        <span v-if="language" class="doc-lang">[{{ language }}]</span>
      </div>
    </div>

    <div class="sync-section sync-center">
      <button
        class="nav-btn"
        :disabled="currentPage <= 1"
        title="Pagina Precedente"
        @click="$emit('prev-page')"
      >
        V.
      </button>

      <div class="page-indicator">
        <span class="page-label">Pag.</span>
        <strong class="page-current">{{ currentPage }}</strong>
        <span class="page-divider">di</span>
        <span class="page-total">{{ totalPages }}</span>
      </div>

      <button
        class="nav-btn"
        :disabled="currentPage >= totalPages"
        title="Pagina Successiva"
        @click="$emit('next-page')"
      >
        R.
      </button>

      <button v-if="isMobile" class="view-toggle-btn" @click="$emit('toggle-view')">
        {{ activeView === 'html' ? 'Mostra Cartaceo' : 'Mostra Testo' }}
      </button>
    </div>

    <div class="sync-section sync-right">
      <div class="action-group download-group">
        <span class="group-label">Estrai:</span>
        <a v-if="htmlUrl" :href="htmlUrl" download class="dl-btn" title="Scarica Testo (HTML)"
          >HTM</a
        >
        <a v-if="pdfUrl" :href="pdfUrl" download class="dl-btn" title="Scarica Originale (PDF)"
          >PDF</a
        >
        <a v-if="xmlUrl" :href="xmlUrl" download class="dl-btn" title="Scarica Sorgente (XML)"
          >XML</a
        >
      </div>

      <div class="action-group popout-group">
        <span class="group-label">Isola:</span>
        <a :href="popoutHtml" target="_blank" class="pop-btn" title="Apri Testo in nuova finestra"
          >HTM</a
        >
        <a
          :href="popoutPdf"
          target="_blank"
          class="pop-btn"
          title="Apri Originale in nuova finestra"
          >PDF</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.sync-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--paper-000);
  border-bottom: 3px double var(--ink-300);
  font-family: var(--font-display, Georgia, serif);
  gap: 1rem;
}

.sync-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.sync-left {
  flex: 1;
  min-width: 0; 
}

.sync-center {
  flex: 0 0 auto;
  justify-content: center;
  gap: 0.75rem;
}

.sync-right {
  flex: 1;
  justify-content: flex-end;
  gap: 1.5rem;
}


.back-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: var(--ink-900);
  font-size: 1.05rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.back-link:hover {
  color: var(--rubric-700);
}

.rubric-mark {
  color: var(--rubric-700);
  font-size: 1.2rem;
  line-height: 1;
}

.doc-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  overflow: hidden;
  border-left: 1px dotted var(--ink-300);
  padding-left: 1.5rem;
}

.doc-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--ink-900);
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-lang {
  font-size: 0.85rem;
  color: var(--ink-500);
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}


.nav-btn {
  background: transparent;
  border: 1px solid var(--ink-300);
  color: var(--ink-900);
  font-family: var(--font-display, Georgia, serif);
  font-size: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 2px;
}

.nav-btn:hover:not(:disabled) {
  background: var(--paper-100);
  border-color: var(--rubric-700);
  color: var(--rubric-700);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 1rem;
  color: var(--ink-700);
  padding: 0 0.5rem;
}

.page-label,
.page-divider {
  font-style: italic;
  font-size: 0.9rem;
}

.page-current {
  color: var(--rubric-700);
  font-weight: normal;
  font-size: 1.1rem;
}

.page-total {
  color: var(--ink-900);
}

.view-toggle-btn {
  background: var(--ink-900);
  color: var(--paper-000);
  border: 1px solid var(--ink-900);
  font-family: var(--font-body, serif);
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.view-toggle-btn:hover {
  background: var(--rubric-700);
  border-color: var(--rubric-700);
}


.action-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.group-label {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--ink-500);
  margin-right: 0.2rem;
}

.dl-btn,
.pop-btn {
  text-decoration: none;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--ink-200);
  color: var(--ink-700);
  background: var(--paper-100);
  transition: all 0.2s ease;
}

.dl-btn:hover {
  background: var(--gold-600);
  color: var(--paper-000);
  border-color: var(--gold-600);
}

.pop-btn:hover {
  background: var(--ink-700);
  color: var(--paper-000);
  border-color: var(--ink-700);
}


@media (max-width: 900px) {
  .sync-controls {
    flex-wrap: wrap;
    padding: 0.5rem 1rem;
  }
  .sync-left {
    flex: 1 1 100%;
    border-bottom: 1px dotted var(--ink-200);
    padding-bottom: 0.5rem;
  }
  .doc-info {
    border-left: none;
    padding-left: 0;
  }
  .sync-center {
    flex: 1;
    justify-content: flex-start;
  }
  .sync-right {
    flex: 1;
  }
  .action-group .group-label {
    display: none;
  }
}
</style>
