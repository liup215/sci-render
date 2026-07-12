# Active Context

## Current Focus
Implemented text editing enhancements. Added an inline `TextEditor` overlay that appears on double-clicking a text object, supporting direct text editing with Enter to commit and Escape to cancel. Extended `TextObject` with `fontFamily`, `fontStyle`, and `align`. Added text formatting controls to the Properties panel (font family, font size, bold, italic, alignment).

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

## Next Steps
1. Choose the next MVP feature (export options, UI polish, or advanced drawing tools).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
