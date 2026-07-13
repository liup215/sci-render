# Active Context

## Current Focus
Fixed the SVG importer so it correctly handles Inkscape-exported SVGs with inline `style` attributes and nested `<g transform="translate(...)">` groups.

Key changes:
- Extended `IconImporter.tsx` to parse `fill`/`stroke`/`stroke-width` from inline `style="..."` attributes, not just XML attributes.
- Added group-transform accumulation (`parseTranslate`, `accumulateGroupTranslate`) so ancestor `<g transform="translate(...)">` offsets are applied to path coordinates.
- Added `getPathBBox()` using the browser SVG `getBBox()` API to compute the true visual bounds of translated paths.
- Rewrote `translatePathData()` to shift absolute command coordinates by group offsets and to convert the initial relative `m` into an absolute `M` at the translated origin, fixing a bounding-box inflation bug.
- Width/height are now derived from the computed visual bbox, making generated JSON dimensions match the actual icon size.
- Verified by importing the user's pasted Inkscape SVG: preview viewBox is `0 0 43.102 91.083` (matching expectations), and the icon inserts correctly into the canvas via the library.
- Production build passes; changes pushed to `main` on GitHub.

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
