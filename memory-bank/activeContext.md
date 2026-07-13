# Active Context

## Current Focus
The icon library has been restructured around BioRender's scientific category taxonomy and now uses nested navigation: categories → subcategories → icons.

Key changes:
- `src/data/iconPresets.ts` now defines BioRender-inspired top-level categories (Cell Types, Proteins, Nucleic Acids, Human Anatomy, Lab and Objects, Species, Agriculture, Membranes, Cell Structures, Epithelium, Lipids and Carbs, Chemistry, Graphs and Symbols, Arrows and Shapes, Biomoji), each with subcategories and representative SVG `PathObject` presets.
- `IconLibraryContent` displays a categories grid first; clicking a category reveals its subcategory list, and clicking a subcategory reveals the icons grid. A Back button returns to the previous level.
- Search filters across all preset names, categories, and subcategories, overriding the nested view while a query is active.
- The library is accessed from the left sidebar's Library category, consistent with the existing BioRender-style two-level toolbox.
- Drawing-tool interaction remains: drawing-tool clicks on existing objects select the top-most object and switch back to select mode.

Verification confirmed in a production build (`npm run build && npm run preview`) to avoid the Vite dev HMR store-duplication issue.

Verification confirmed in a production build (`npm run build && npm run preview`) to avoid the Vite dev HMR store-duplication issue.

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
1. Choose the next MVP feature (advanced drawing tools, additional export formats, or UI polish).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.
4. Later: investigate mitigating the Vite dev HMR store-duplication issue (e.g., disable persist in dev or enforce a singleton store reference) to make automated console probes reliable.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
