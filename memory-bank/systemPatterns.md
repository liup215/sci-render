# System Patterns

## Architecture
- **Single-page app** served by Vite dev server; all state in browser for MVP.
- **Canvas rendering** handled by Konva (HTML5 Canvas abstraction) via `react-konva`.
- **Global state** managed by Zustand for slides, selected objects, zoom, tool mode, and UI toggles.
- **Component structure**:
  - `App`: layout shell; mounts global keyboard shortcut hook.
  - `Toolbar`: tool buttons, zoom, alignment, grid/snap toggles, export trigger.
  - `SlidePanel`: slide list with add/delete/rename.
  - `CanvasStage`: Konva stage, layers, grid, drawing, selection rectangle, transformer, export.
  - `Shape`: renders each `CanvasObject` and handles drag/snap/selection; renders `GroupObject` recursively with non-interactive children.
  - `PropertiesPanel`: edit canvas and selected object properties.
  - `useKeyboardShortcuts`: global keydown handler for tools and editing actions.

## State Shape
- `slides: Slide[]` each with `id`, `name`, `objects: CanvasObject[]`.
- `activeSlideId: string | null`.
- `selectedIds: string[]`.
- `tool: 'select' | 'rect' | 'circle' | 'text' | 'line' | 'arrow'`.
- `zoom: number`, `stagePos: {x,y}`.
- `canvasSize: {width,height}`, `canvasColor: string`.
- `gridVisible`, `snapEnabled`, `guides`.

## Interaction Patterns
- Pointer events on stage create objects based on active tool; a `drawingRef` wrapper keeps fast mouse sequences consistent.
- Click selects; drag moves; transform handles resize/rotate.
- Snapping uses object bounds and grid spacing; guides rendered as dashed Konva lines.
- Slides are independent canvases sharing the same viewport state.
- Grouped objects are stored as a `GroupObject` with children in relative coordinates; drag/snap/duplicate operate on the group, and ungroup converts children back to absolute coordinates.
- Transformer nodes skip group objects; groups are moved/resized via drag only.
- Keyboard shortcuts dispatch through `useEditorStore.getState()` to avoid stale closures.
