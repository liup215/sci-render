# Active Context

## Current Focus
MVP polished with keyboard shortcuts and tool cursors. Decide between local persistence or shape-library expansion next.

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- First feature slice: canvas editor (zoom, grid, rulers, alignment, multi-slide).
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Keyboard shortcuts are global and ignored while typing in inputs.

## Next Steps
1. Persist slides to localStorage / IndexedDB so work survives reloads.
2. Expand shape library (arrows, paths, icons) post-MVP.
3. Consider Tailwind or a component library for UI polish.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
