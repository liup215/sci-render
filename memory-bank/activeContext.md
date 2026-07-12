# Active Context

## Current Focus
Copy/paste for canvas objects is complete and verified. Selected objects are cloned into an in-memory clipboard with `Ctrl+C` and pasted with a 20px offset using `Ctrl+V`; pasted objects become the new selection. The implementation reuses the existing `cloneObject` helper, so groups, arrows, lines, paths, images, and text are all supported.

A bug where `Ctrl+C` cancelled the current selection was fixed: the tool-switching branch in `useKeyboardShortcuts` ran before the copy/paste branch and treated `c` as the Circle tool shortcut, calling `setTool('circle')` which clears `selectedIds`. Tool switching now ignores keypresses when `Ctrl`/`Cmd` is held.

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

## Next Steps
1. Choose the next MVP feature (export options, UI polish, or advanced drawing tools).
2. Continue incremental implementation with build + browser verification.
3. Commit and push after each feature slice.

## Open Questions
- Whether to add Tailwind or another UI library after MVP core is stable.
- Whether to persist files locally (IndexedDB) or add backend later.
