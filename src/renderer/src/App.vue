<script setup>
import { computed } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import FolderSelector from './components/FolderSelector.vue'
import DocumentList from './components/DocumentList.vue'
import ValidationPanel from './components/ValidationPanel.vue'
import BuildControls from './components/BuildControls.vue'
import BuildLog from './components/BuildLog.vue'
import { useBuild } from './composables/useBuild.js'
import { usePreview } from './composables/usePreview.js'

const {
  sourceFolders,
  outputPath,
  folderResults,
  documents,
  validationOk,
  validationError,
  validating,
  duplicateUuids,
  building,
  buildSuccess,
  buildError,
  buildOutputPath,
  buildLogs,
  hasDocuments,
  hasFolders,
  canBuild,
  htmlDocCount,
  addFolders,
  addFolderPaths,
  removeFolder,
  selectOutput,
  build,
  openOutput,
  resetBuild
} = useBuild()

const {
  opening: previewOpening,
  openError: previewError,
  openLastBuild,
  openFromDialog: openPreviewFromDialog,
  openSite: openPreviewSite
} = usePreview()

const subtitle = computed(() => {
  if (buildSuccess === true) return 'Sito generato con successo'
  if (buildSuccess === false) return 'Generazione fallita'
  if (validating.value) return 'Collazione dei fascicoli in corso…'
  if (hasDocuments.value && validationOk.value) {
    return `${htmlDocCount.value} documento${htmlDocCount.value === 1 ? '' : 'i'} pront${htmlDocCount.value === 1 ? 'o' : 'i'} da ${sourceFolders.value.length} fascicol${sourceFolders.value.length === 1 ? 'o' : 'i'}`
  }
  if (hasDocuments.value) return 'Errori di validazione riscontrati'
  return 'Biblioteca digitale distribuita'
})

function handleAddPaths(paths) {
  addFolderPaths(paths)
}

function handleOpenLastProject() {
  openLastBuild(buildOutputPath.value)
}

function handleOpenJustBuiltProject() {
  if (buildOutputPath.value) {
    openPreviewSite(buildOutputPath.value)
  }
}
</script>

<template>
  <div class="app-shell">
    <HeaderBar
      :subtitle="subtitle"
      :has-last-build="!!buildOutputPath"
      :preview-opening="previewOpening"
      :preview-error="previewError"
      @open-last-project="handleOpenLastProject"
      @open-project-from-dialog="openPreviewFromDialog"
    />

    <main class="app-main">
      <div class="book-spread">
        <div class="book-page page-left">
          <section class="chapter">
            <h2 class="chapter-title">I. Fascicoli Sorgente</h2>
            <FolderSelector
              :folders="sourceFolders"
              :disabled="building"
              @add="addFolders"
              @add-paths="handleAddPaths"
              @remove="removeFolder"
            />
          </section>

          <section class="chapter">
            <h2 class="chapter-title">II. Indice dei Documenti</h2>
            <DocumentList :folder-results="folderResults" />
          </section>
        </div>

        <div class="book-spine"></div>

        <div class="book-page page-right">
          <section class="chapter">
            <h2 class="chapter-title">III. Note di Collazione</h2>
            <ValidationPanel
              :documents="documents"
              :ok="validationOk"
              :error="validationError"
              :validating="validating"
              :duplicate-uuids="duplicateUuids"
            />
          </section>

          <section class="chapter">
            <h2 class="chapter-title">IV. Il Torchio</h2>
            <BuildControls
              :source-folders="sourceFolders"
              :output-path="outputPath"
              :can-build="canBuild"
              :building="building"
              :build-success="buildSuccess"
              :build-error="buildError"
              :build-output-path="buildOutputPath"
              :html-doc-count="htmlDocCount"
              :preview-opening="previewOpening"
              :validating="validating"
              :validation-ok="validationOk"
              @select-output="selectOutput"
              @build="build"
              @open-output="openOutput"
              @open-preview="handleOpenJustBuiltProject"
              @reset="resetBuild"
            />
          </section>

          <section class="chapter">
            <h2 class="chapter-title">V. Cronaca</h2>
            <BuildLog :logs="buildLogs" />
          </section>
        </div>
      </div>

      <footer class="app-footer">
        <p>
          <small>
            Petrarca Project ❧
            <a href="https://delta2studio.pages.dev" target="_blank">Delta2Studio</a></small
          >
        </p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--paper-100);
}

.app-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.book-spread {
  display: flex;
  background: var(--paper-000);
  border: 1px solid var(--ink-200);
  box-shadow:
    0 4px 12px rgba(32, 29, 24, 0.08),
    inset 0 0 40px rgba(139, 133, 114, 0.05);
  border-radius: var(--radius-sm);
  position: relative;
  min-height: 70vh;
}

.book-page {
  flex: 1;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 50%;
}

.book-spine {
  width: 2px;
  background: linear-gradient(to right, var(--ink-200) 0%, transparent 50%, var(--ink-200) 100%);
  border-left: 1px dashed var(--ink-300);
  box-shadow:
    -2px 0 5px rgba(0, 0, 0, 0.02),
    2px 0 5px rgba(0, 0, 0, 0.02);
}

.chapter-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--rubric-700);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
  border-bottom: 3px double var(--ink-200);
  padding-bottom: 0.5rem;
}

.app-footer {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0 1rem;
}

.app-footer small {
  color: var(--ink-300);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-style: italic;
  letter-spacing: 0.05em;
}
</style>
