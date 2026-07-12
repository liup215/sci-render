# Active Context

## Current Focus
Added a basic icon/shape preset library panel with categories (基础形状, 常用图标) and built-in path presets (triangle, star, pentagon, hexagon, heart, cloud, check, lightning). Added a new `PathObject` type rendered with `Konva.Path`, including transform, snap, alignment, duplicate, group/ungroup, and persistence support.

## Decisions Made
- Tech stack: React + TypeScript + Vite + react-konva + Zustand.
- Repository root: `C:\Users\22569\Documents\20-Projects\sci-render`.
- Git remote: public GitHub repo `liup215/sci-render`, default branch `main`.
- Keyboard shortcuts are global and ignored while typing in inputs.
- Preset icons are stored as SVG path `data` strings and inserted as `PathObject`s centered on the canvas.

## Next Steps
1. Choose the next MVP feature (e.g., layers/z-index, undo/redo, or UI polish).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
