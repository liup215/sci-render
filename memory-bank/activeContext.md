# Active Context

## Current Focus
Implemented a Layers / z-index panel as a tab on the right-side panel. Added store actions for `bringToFront`, `sendToBack`, `moveForward`, and `moveBackward`, with ordering preserved across reorder operations. Added keyboard shortcuts `]`/`[` (move forward/backward) and `Ctrl+]`/`Ctrl+[` (bring to front/send to back).

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Git remote: public GitHub repo `liup215/sci-render`, default branch `main`.
- Keyboard shortcuts are global and ignored while typing in inputs.
- The right panel uses tabs (Properties / Layers) to avoid adding another panel and keep layout compact.
- Layer list is shown top-to-bottom (highest z-index first) with row selection and ordering buttons.

## Next Steps
1. Choose the next MVP feature (undo/redo, rulers, or UI polish).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
