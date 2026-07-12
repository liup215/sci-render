# Active Context

## Current Focus
The left toolbox has been redesigned to match BioRender's category-driven navigation. Instead of listing every drawing tool directly, the left sidebar now shows a narrow vertical list of high-level categories; selecting a category reveals its tools or the icon library in the wider panel to the right.

Key layout changes (BioRender-style v3):
- `App.tsx` still renders a minimal `<Toolbar />` in the header and `<LeftPanel />` in the body.
- Top header holds global actions only: brand, undo/redo/delete, view toggles (grid/rulers/snap), insert/export (image/PNG/SVG), and zoom.
- `LeftPanel` remains a two-column sidebar, but the narrow left column is now a category selector rather than a flat tool list.
- `<Toolbox />` now renders top-level categories: Select, Shapes, Lines, Text, Draw, Library. Clicking a category highlights it and passes the selection upward.
- New `<ToolPalette />` renders the sub-tools for the active category (e.g., Shapes → Rectangle / Circle; Lines → Line / Arrow) and swaps in `<IconLibraryContent />` for the Library category.
- `IconLibraryContent` still provides search and categorized preset icons, now accessed through the Library category.
- Drawing-tool interaction: when a drawing tool (rectangle, circle, line, arrow, text, pen) is active and the user clicks on an existing object, the click selects the top-most object and switches back to the select tool instead of creating a new shape. The left-panel category highlights also sync to the current tool so the UI stays consistent.
- Slides remain in a "Slides" tab inside the right-side `PropertiesPanel`.
- Align and ordering buttons are still removed from the top header; ordering lives in the Layers tab.

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
