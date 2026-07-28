import { ref, computed, toRaw, onBeforeUnmount } from 'vue';
export function useBuild() {
  const sourceFolders = ref([]);
  const outputPath = ref(null);
  const folderResults = ref([]);
  const validationOk = ref(false);
  const validationError = ref(null);
  const validating = ref(false);
  const duplicateUuids = ref([]);
  const building = ref(false);
  const buildSuccess = ref(null);
  const buildError = ref(null);
  const buildOutputPath = ref(null);
  const buildLogs = ref([]);
  let unsubLog = null;
  const documents = computed(() => folderResults.value.flatMap(f => f.documents));
  const hasDocuments = computed(() => documents.value.length > 0);
  const hasFolders = computed(() => sourceFolders.value.length > 0);
  const canBuild = computed(() => validationOk.value && sourceFolders.value.length > 0 && !!outputPath.value);
  const htmlDocCount = computed(() => documents.value.filter(d => d.format === 'html').length);
  const totalDocCount = computed(() => documents.value.length);
  function listenBuildLogs() {
    if (window.api?.onBuildLog) {
      unsubLog = window.api.onBuildLog(msg => {
        buildLogs.value.push({
          time: Date.now(),
          message: msg
        });
      });
    }
  }
  function stopListenBuildLogs() {
    if (unsubLog) {
      unsubLog();
      unsubLog = null;
    }
  }
  async function addFolders() {
    const paths = await window.api?.openFolders();
    if (paths && paths.length > 0) {
      await addFolderPaths(paths);
    }
  }
  async function addFolder() {
    const path = await window.api?.openFolder();
    if (path) {
      await addFolderPaths([path]);
    }
  }
  async function addFolderPaths(paths) {
    resetBuild();
    const existing = new Set(sourceFolders.value);
    const toAdd = paths.filter(p => !existing.has(p));
    if (toAdd.length === 0) return;
    sourceFolders.value = [...sourceFolders.value, ...toAdd];
    await validate();
  }
  async function removeFolder(folderPath) {
    resetBuild();
    sourceFolders.value = sourceFolders.value.filter(p => p !== folderPath);
    if (sourceFolders.value.length > 0) {
      await validate();
    } else {
      folderResults.value = [];
      validationOk.value = false;
      validationError.value = null;
      duplicateUuids.value = [];
    }
  }
  async function validate() {
    if (sourceFolders.value.length === 0) return;
    validating.value = true;
    validationError.value = null;
    try {
      const plainFolders = toRaw(sourceFolders.value).map(p => toRaw(p));
      const result = await window.api.validateAll(plainFolders);
      folderResults.value = result.folders;
      validationOk.value = result.ok;
      duplicateUuids.value = result.duplicateUuids || [];
      if (!result.ok) {
        validationError.value = duplicateUuids.value.length > 0 ? 'Alcuni documenti hanno errori di validazione o uuid duplicati tra cartelle diverse.' : 'Alcuni documenti hanno errori di validazione.';
      }
    } catch (err) {
      validationError.value = err.message;
      validationOk.value = false;
    } finally {
      validating.value = false;
    }
  }
  async function selectOutput() {
    const path = await window.api?.saveOutput();
    if (path) {
      outputPath.value = path;
    }
  }
  async function build() {
    if (!canBuild.value) return;
    building.value = true;
    buildSuccess.value = null;
    buildError.value = null;
    buildOutputPath.value = null;
    buildLogs.value = [];
    listenBuildLogs();
    try {
      const plainFolders = toRaw(sourceFolders.value).map(p => toRaw(p));
      const result = await window.api.generateSite(plainFolders, toRaw(outputPath.value));
      buildSuccess.value = result.success;
      buildOutputPath.value = result.outputPath;
      if (!result.success) {
        buildError.value = result.error;
      }
    } catch (err) {
      buildSuccess.value = false;
      buildError.value = err.message;
    } finally {
      stopListenBuildLogs();
      building.value = false;
    }
  }
  async function openOutput() {
    if (buildOutputPath.value) {
      await window.api.openOutput(buildOutputPath.value);
    }
  }
  function resetBuild() {
    buildSuccess.value = null;
    buildError.value = null;
    buildOutputPath.value = null;
    buildLogs.value = [];
  }
  function resetAll() {
    sourceFolders.value = [];
    outputPath.value = null;
    folderResults.value = [];
    validationOk.value = false;
    validationError.value = null;
    duplicateUuids.value = [];
    resetBuild();
  }
  onBeforeUnmount(() => {
    stopListenBuildLogs();
  });
  return {
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
    totalDocCount,
    addFolder,
    addFolders,
    addFolderPaths,
    removeFolder,
    validate,
    selectOutput,
    build,
    openOutput,
    resetBuild,
    resetAll
  };
}