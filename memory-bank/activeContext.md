# Active Context

## Current Focus
Fixed Group / Ungroup: groups now display a Transformer selection box and support scale/rotate transforms. Group transforms are applied to children when ungrouping.

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- First feature slice: canvas editor (zoom, grid, rulers, alignment, multi-slide).
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Git remote: public GitHub repo `liup215/sci-render`, default branch `main`.
- Keyboard shortcuts are global and ignored while typing in inputs.

## Next Steps
1. Choose the next MVP feature (e.g., basic icon library, layers/z-index, undo/redo, or UI polish).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
