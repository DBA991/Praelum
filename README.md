# Praelum

**Part of the [Petrarca Project](https://github.com/DBA991/Petrarca-Project)**

Praelum is a small Electron desktop application that turns a folder of serialized documents — the output of [**Scriptorium**](https://github.com/DBA991/Scriptorium)'s *Export* stage — into a complete, static, browsable [**Pulpitum**](https://github.com/DBA991/Pulpitum) website. It validates the source material, runs the actual Astro-based site build, and lets you preview the result locally before it goes anywhere else. In the digitization pipeline, Praelum is the "print run": it takes finished, individually exported editions and presses them into a single distributable digital library.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Workflow](#workflow)
- [Validation](#validation)
- [Build Pipeline](#build-pipeline)
- [Local Preview](#local-preview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Architecture Overview

Praelum is a standard two-process Electron app with a deliberately thin main process:

- **Main process** (`src/main/`) — five small, single-purpose modules: `validator.js` (read-only source-folder validation), `astro-engine.js` (the actual site-generation pipeline), `filemanager.js` (open/save dialogs, revealing output in the OS file manager), `previewServer.js` (a local Express server for browsing a generated site), and `fs-utils.js` (shared filesystem helpers). `index.js` only wires these together as IPC handlers and manages window/server lifecycle.
- **Renderer process** (`src/renderer/src/`) — a single-page Vue 3 app (no router — one view, styled as an open book/ledger) built around two composables: `useBuild.js` (source folders, validation state, build state and logs) and `usePreview.js` (opening a generated site in a preview window).
- **Preload script** (`src/preload/`) — exposes the `window.api` bridge for dialogs, validation, build, and preview control.
- **Bundled engine** (`resources/pulpitum-engine/`) — the actual Astro project used as the site template/generator. It ships inside Praelum's resources (unpacked from the asar archive in production builds) and is copied into a temporary workspace for every build. This engine is also published as its own standalone, directly-editable project — see its own README for details on the generated site itself.

---

## Workflow

The UI is laid out as a five-chapter book spread, each chapter mapping directly onto one step of the pipeline:

1. **I. Fascicoli Sorgente ("Source Signatures")** — add one or more source folders (each containing exported documents from Scriptorium), via a folder picker or drag-and-drop. Adding or removing a folder automatically re-triggers validation of the whole current set.
2. **II. Indice dei Documenti ("Document Index")** — a live index of every document found across all selected source folders, grouped by folder.
3. **III. Note di Collazione ("Collation Notes")** — the validation report: per-document errors/warnings, and any UUID collisions found across different source folders.
4. **IV. Il Torchio ("The Press")** — choose an output folder and run the build, with the Build button only enabled once validation passes (`canBuild`); shows build progress, success/error state, and, on success, buttons to reveal the output folder or open it directly in the preview server.
5. **V. Cronaca ("Chronicle")** — a live, auto-scrolling log of the build process as it happens, streamed from the main process.

A header bar action ("Open project") also lets you preview any previously generated Pulpitum site — either the last one built in the current session, or any other one picked via a folder dialog — without needing to rebuild it.

---

## Validation

Validation (`validator.js`) is entirely **read-only**: it never writes to or moves anything on disk, only inspects the source folders and reports what it finds. For each source folder, it expects a flat naming convention — `[format].[uuid].[name].json`, e.g. `html.3f2a1b.dante-inferno.json` — and for every `.json` file found:

- Parses the JSON and extracts `title`/`language` (if present) for display.
- Checks that the required fields for the document's declared format are present: `uuid`, `title`, `language`, `htmlPath`, `pdfPath`, and `xmlPath` for `html`-format documents, or just `uuid`, `pdfPath`, and `xmlPath` for other formats.
- Cross-checks that every referenced path (`htmlPath`/`pdfPath`/`xmlPath`) actually points to a file with the matching extension present alongside the JSON, flagging a warning if the extension doesn't match what's expected.
- Aggregates results across **all** selected folders and flags any **UUID that appears in more than one folder** as a blocking, cross-folder duplicate — since Praelum can combine documents from several source folders into a single site, this is the one check that can't be done folder-by-folder in isolation.

The build button only becomes available once this whole aggregated validation passes.

---

## Build Pipeline

Once validation passes and an output folder is chosen, `astro-engine.js` runs the actual site generation as a sequence of clearly logged steps (each one streamed live to the renderer via `build:log` IPC events):

1. **Workspace setup** — creates a fresh temporary workspace (under the OS temp directory, uniquely named per build) and copies the bundled Pulpitum engine (the Astro project in `resources/pulpitum-engine/`) into it, leaving the original bundled copy untouched.
2. **Source merge** — copies the documents from every selected source folder into the workspace's content directories.
3. **Dependency install** — runs `npm install` inside the workspace to fetch the Astro engine's own dependencies.
4. **Internal validation** — re-runs the engine's own `build-helper.js validate` step as a final internal safety check before committing to a full build.
5. **Astro build** — syncs any static/public assets and runs the actual `astro build`, producing a complete static site (`dist/`).
6. **Output copy** — copies the built `dist/` folder into the user-chosen output path.
7. **Cleanup** — removes the temporary workspace entirely, so no build artifacts or copied source documents linger on disk outside the final output folder.

---

## Local Preview

`previewServer.js` runs a minimal local **Express** server to browse a generated (or previously generated) Pulpitum site without needing any external web server:

- Serves a chosen site folder as static files, after confirming it actually contains an `index.html`.
- Automatically finds a free local TCP port (`127.0.0.1`) rather than assuming one is available.
- Enforces a **single active preview at a time** — starting a new preview server automatically stops any previous one first, rather than accumulating orphaned servers across sessions.
- The resulting URL is opened in a dedicated preview `BrowserWindow`, kept separate from the main Praelum window.

---

## Tech Stack

- **Application shell:** Electron, `electron-vite`, `electron-builder` (Windows/macOS/Linux builds)
- **UI framework:** Vue 3 (Composition API, `<script setup>`)
- **Local preview server:** Express
- **Site generation engine:** Astro (bundled as `resources/pulpitum-engine/`, invoked via `npm install` + `astro build` in an isolated temporary workspace)

## Project Structure

```
Praelum/
├── resources/
│   ├── icon.png
│   └── pulpitum-engine/          # Bundled Astro site engine (see its own README)
├── src/
│   ├── main/                     # Electron main process
│   │   ├── index.js              # App entry, window lifecycle, IPC wiring
│   │   ├── validator.js          # Read-only source-folder validation
│   │   ├── astro-engine.js       # Workspace setup → merge → install → build → copy → cleanup
│   │   ├── filemanager.js        # Open/save dialogs, reveal-in-file-manager
│   │   ├── previewServer.js      # Express-based local static site preview (single active instance)
│   │   └── fs-utils.js           # Shared filesystem helpers, bundled-engine path resolution
│   ├── preload/                  # IPC bridge (window.api)
│   └── renderer/src/
│       ├── App.vue                # Single-page "book spread" layout (5 chapters)
│       ├── main.js
│       ├── composables/
│       │   ├── useBuild.js        # Source folders, validation state, build state & logs
│       │   └── usePreview.js      # Opening a generated (or existing) site in the preview server
│       └── components/
│           ├── HeaderBar.vue      # Title bar + "Open project" preview entry point
│           ├── OpenProjectButton.vue
│           ├── FolderSelector.vue # Source folder picker + drag & drop
│           ├── DocumentList.vue   # Live document index across selected folders
│           ├── ValidationPanel.vue # Per-document errors/warnings, duplicate UUIDs
│           ├── BuildControls.vue  # Output selection, build trigger, post-build actions
│           └── BuildLog.vue       # Live, auto-scrolling build log
├── electron.vite.config.mjs
└── package.json
```
