import { ref } from 'vue'
export function usePreview() {
  const opening = ref(false)
  const openError = ref(null)
  const lastOpenedPath = ref(null)
  async function openLastBuild(lastBuildOutputPath) {
    if (!lastBuildOutputPath) return
    await openSite(lastBuildOutputPath)
  }
  async function openFromDialog() {
    const path = await window.api?.openSiteFolderDialog()
    if (path) {
      await openSite(path)
    }
  }
  async function openSite(sitePath) {
    opening.value = true
    openError.value = null
    try {
      const result = await window.api.openPreview(sitePath)
      if (!result.success) {
        openError.value = result.error
        return
      }
      lastOpenedPath.value = sitePath
    } catch (err) {
      openError.value = err.message
    } finally {
      opening.value = false
    }
  }
  return {
    opening,
    openError,
    lastOpenedPath,
    openLastBuild,
    openFromDialog,
    openSite
  }
}
