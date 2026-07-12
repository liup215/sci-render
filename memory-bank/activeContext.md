# Active Context

## Current Focus
The main application UI has been reorganized into a BioRender-style layout: a single dark top header that combines the brand and a grouped toolbar, a left sidebar with tabbed "Slides" and "Icons" panels, a central canvas area, and the existing right-side Properties/Layers panel.

Key layout changes (BioRender-style v2):
- `App.tsx` renders a minimal `<Toolbar />` inside the header and `<LeftPanel />` in the body.
- Top header now only holds global actions: brand, undo/redo/delete, view toggles (grid/rulers/snap), insert/export (image/PNG/SVG), and zoom.
- `LeftPanel` is a two-column sidebar: a narrow vertical `<Toolbox />` on the left and a large searchable `IconLibraryContent` on the right.
- `<Toolbox />` now groups tools logically with small labels: Select, Shapes (Rectangle/Circle), Lines (Line/Arrow), Text, Draw (Pen).
- `IconLibraryContent` now includes a search input that filters presets by name within the active category, plus an empty state.
- Slides have moved out of the left sidebar into a new "Slides" tab in the right-side `PropertiesPanel`, so the right panel now has Properties / Layers / Slides tabs.
- Align and ordering buttons were removed from the top header to reduce clutter; ordering is still available in the Layers tab, and alignment can be reintroduced later via a context menu or dedicated properties section.

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
