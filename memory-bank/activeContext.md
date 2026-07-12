# Active Context

## Current Focus
Arrow tool added to the shape library. Next feature: uploadable image object or basic icon library.

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- First feature slice: canvas editor (zoom, grid, rulers, alignment, multi-slide).
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Git remote: public GitHub repo `liup215/sci-render`, default branch `main`.
- Keyboard shortcuts are global and ignored while typing in inputs.

## Next Steps
1. Add uploadable image object to the canvas.
2. Consider Tailwind or a component library for UI polish.
3. Decide on backend persistence strategy post-MVP.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
