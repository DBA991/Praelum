export async function createPdfAdapter(container) {
  const pdfjs = await loadPdfjs();
  const adapter = new PdfjsAdapter(container, pdfjs);
  await adapter._init();
  return adapter;
}
let _pdfjsPromise = null;
function loadPdfjs() {
  if (_pdfjsPromise) return _pdfjsPromise;
  _pdfjsPromise = (async () => {
    const pdfjsLib = await import('pdfjs-dist');
    const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
    return pdfjsLib;
  })();
  return _pdfjsPromise;
}
class PdfjsAdapter {
  constructor(container, pdfjs) {
    this.container = container;
    this.pdfjs = pdfjs;
    this.pdfDoc = null;
    this._currentPage = 1;
    this._zoom = 1.0;
    this._pageChangeCallbacks = new Set();
    this._renderTask = null;
    this._canvas = null;
  }
  async _init() {
    this._canvas = document.createElement('canvas');
    this._canvas.className = 'pdf-page-canvas';
    this.container.appendChild(this._canvas);
  }
  get currentPage() {
    return this._currentPage;
  }
  get numPages() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }
  get zoom() {
    return this._zoom;
  }
  async load(url) {
    const loadingTask = this.pdfjs.getDocument(url);
    this.pdfDoc = await loadingTask.promise;
    this._currentPage = 1;
    await this._renderPage(this._currentPage);
    this._notifyPageChange();
  }
  async goToPage(n) {
    if (!this.pdfDoc) return;
    const target = Math.max(1, Math.min(n, this.numPages));
    if (target === this._currentPage) return;
    this._currentPage = target;
    await this._renderPage(this._currentPage);
    this._notifyPageChange();
  }
  async setZoom(level) {
    if (level === 'fit' || level === 'auto') {
      this._zoom = await this._computeFitZoom();
    } else {
      this._zoom = Number(level) || 1;
    }
    await this._renderPage(this._currentPage);
  }
  zoomIn() {
    return this.setZoom(Math.min(this._zoom + 0.25, 5));
  }
  zoomOut() {
    return this.setZoom(Math.max(this._zoom - 0.25, 0.25));
  }
  onPageChange(cb) {
    this._pageChangeCallbacks.add(cb);
    return () => this._pageChangeCallbacks.delete(cb);
  }
  destroy() {
    this._pageChangeCallbacks.clear();
    if (this._renderTask) {
      try {
        this._renderTask.cancel();
      } catch (_) {}
      this._renderTask = null;
    }
    if (this._canvas) {
      this._canvas.remove();
      this._canvas = null;
    }
    if (this.pdfDoc) {
      try {
        this.pdfDoc.destroy();
      } catch (_) {}
      this.pdfDoc = null;
    }
  }
  async _renderPage(pageNum) {
    if (!this.pdfDoc || !this._canvas) return;
    const page = await this.pdfDoc.getPage(pageNum);
    const baseViewport = page.getViewport({
      scale: 1
    });
    let scale = this._zoom;
    if (this._zoom <= 0) {
      scale = this._computeFitScale(baseViewport.width);
    }
    const viewport = page.getViewport({
      scale
    });
    const outputScale = window.devicePixelRatio || 1;
    const canvas = this._canvas;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    const context = canvas.getContext('2d');
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
    if (this._renderTask) {
      try {
        this._renderTask.cancel();
      } catch (_) {}
    }
    this._renderTask = page.render({
      canvasContext: context,
      viewport,
      transform
    });
    try {
      await this._renderTask.promise;
    } catch (err) {
      if (err && err.name !== 'RenderingCancelledException') {
        console.error('Errore render PDF:', err);
      }
    } finally {
      this._renderTask = null;
    }
  }
  _computeFitScale(pageWidth) {
    const containerWidth = this.container.clientWidth || 600;
    return Math.max(0.25, (containerWidth - 24) / pageWidth);
  }
  async _computeFitZoom() {
    if (!this.pdfDoc) return 1;
    const page = await this.pdfDoc.getPage(this._currentPage);
    const vp = page.getViewport({
      scale: 1
    });
    return this._computeFitScale(vp.width);
  }
  _notifyPageChange() {
    const total = this.numPages;
    for (const cb of this._pageChangeCallbacks) {
      try {
        cb(this._currentPage, total);
      } catch (_) {}
    }
  }
}