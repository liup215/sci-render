# Active Context

## Current Focus
Implemented undo / redo history. Added `past`/`future` stacks to the Zustand store, a `snapshot` helper, a `withHistory` wrapper around mutating actions, and `undo`/`redo` actions. Wired toolbar Undo/Redo buttons and keyboard shortcuts `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`. History is not persisted across reloads.

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Git remote: public GitHub repo `liup215/sci-render`, default branch `main`.
- Keyboard shortcuts are global and ignored while typing in inputs.
- The right panel uses tabs (Properties / Layers) to avoid adding another panel and keep layout compact.
- Layer list is shown top-to-bottom (highest z-index first) with row selection and ordering buttons.
- Undo/redo snapshots exclude the history stacks and transient guides.
- `persist` partialize excludes `past`/`future` so history is reset on reload.

## Next Steps
1. Choose the next MVP feature (rulers, UI polish, text editing improvements, or export options).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
