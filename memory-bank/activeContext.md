# Active Context

## Current Focus
Restructured icon storage and added a developer tool for importing SVGs into the source icon library.

Key changes:
- Split the monolithic `src/data/iconPresets.ts` into 15 per-category JSON files under `src/data/icons/`.
- `iconPresets.ts` now only keeps category metadata and exposes `loadIconCategory()` and `loadAllIconPresets()` for dynamic loading.
- `IconLibraryContent.tsx` lazy-loads category JSON via Vite dynamic imports; search loads all categories in parallel.
- Added `IconImporter.tsx`, a developer modal reachable from the Library panel's "+ SVG" button.
  - Pastes an SVG string, parses `<path>` elements, reads viewBox/width/height/fill/stroke.
  - Lets the user choose category, subcategory, name, and ID.
  - Previews the icon and generates a JSON snippet ready to paste into the matching `src/data/icons/<category>.json` file.
- Verified the production build, dynamic chunk loading, category/subcategory navigation, icon insertion, and importer modal UI.
- Pushed the changes to `main` on GitHub.

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Git remote: public GitHub repo `liup215/sci-render`, default branch `main`.
- Keyboard shortcuts are global and ignored while typing in inputs.
- The right panel uses tabs (Properties / Layers) to avoid adding another panel and keep layout compact.
- Layer list is shown top-to-bottom (highest z-index first) with row selection and ordering buttons.
- Undo/redo snapshots exclude the history stacks and transient guides.
- `persist` partialize excludes `past`/`future` so history is reset on reload.
- Rulers are drawn on HTML `<canvas>` overlays using a 20px grid layout; they respond to `zoom` and `stagePos` from the store.
- Grid lines are rendered as independent `Line` nodes to avoid unintended connecting strokes.
- Inline text editing uses an HTML `<textarea>` absolutely positioned with the same transform (position, scale, rotation) as the Konva Text node; edits commit via `updateObject`.
- Text tool creates the object on mouseup and immediately enters edit mode; select-tool double-click also enters edit mode.
- SVG export is generated manually from the Zustand store rather than rasterized from Konva; this keeps output as true vectors and supports all current object types without adding server-side rendering.
- Freehand pen tool reuses `PathObject` and stores points as normalized SVG path data relative to the path's bounding box; `x`/`y` become the box top-left, `width`/`height` the box size.
- Pen point sampling uses a 2 px distance threshold to avoid overly dense path data.
- The `Tool` union is the single source of truth for toolbar/keyboard tools; drawing helpers accept `Exclude<Tool, 'select' | 'text'>` so new drawing tools are caught by TypeScript.

## Next Steps
1. Build or source original SVG icon content for the new categories (using the SVG importer or drawing in Inkscape).
2. Choose the next MVP feature (advanced drawing tools like bezier curves, additional export formats such as PDF/project JSON, or UI polish like color picker popovers).
3. Continue incremental implementation with build + browser verification.
4. Commit and push after each feature slice.
5. Later: investigate mitigating the Vite dev HMR store-duplication issue (e.g., disable persist in dev or enforce a singleton store reference) to make automated console probes reliable.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
