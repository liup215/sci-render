# Progress

## What Works
- Vite React TS project scaffolded with Konva, Zustand, and utilities.
- Canvas stage with pan/zoom, grid background, and responsive sizing.
- Toolbar with select, rectangle, circle, line, and text tools.
- Shape rendering, selection, multi-selection, and transform handles.
- Drag snapping with alignment guides and toolbar alignment actions.
- Multi-slide panel with add/delete/rename.
- Export active slide to PNG.
- Global keyboard shortcuts: V/R/C/L/T tools, Esc cancel, Ctrl+A select all, Ctrl+D duplicate, arrow-key nudge, Space pan, Delete remove.
- Tool-specific mouse cursors (crosshair for drawing tools, grab/grabbing for pan).
- Production build passes TypeScript and Vite bundling.
- Git repository initialized and pushed to public GitHub repo `https://github.com/liup215/sci-render` on `main`.
- Local persistence via Zustand persist to localStorage; state restored on reload.
- "Reset session" button clears all slides and objects from state and localStorage.
- Arrow drawing tool added with toolbar button, `A` shortcut, Konva Arrow rendering, and persistence support.
- Image upload object added: toolbar Image button loads a local image as a base64 object, scaled to max 200px, draggable, transformable, and persisted.
- Group / Ungroup objects: toolbar buttons, `Ctrl+G` / `Ctrl+Shift+G` shortcuts, recursive Konva Group rendering, drag/snap/duplicate/delete/persistence support. Groups now show a Transformer selection box and can be scaled/rotated; group transforms are baked into children on ungroup.
- Basic icon/shape preset library: toolbar Icons button opens a categorized panel; inserts `PathObject`s rendered with `Konva.Path`. Supports transform, snap, alignment, duplicate, group/ungroup, and persistence.
- Layers / z-index panel: right-side tabbed panel lists objects top-to-bottom with selection and ordering buttons (Top/Up/Down/Bottom). Added `]`/`[` and `Ctrl+]`/`Ctrl+[` keyboard shortcuts.
- Undo / redo: store-level history stacks with pre-mutation snapshots; toolbar buttons and `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` shortcuts; verified add/update undo/redo in browser.
- Rulers UI: toolbar "Rulers" toggle shows/hides horizontal and vertical canvas rulers around the stage; ticks and labels scale with zoom and pan.
- Text editing enhancement: inline `<textarea>` editor on double-click; `TextObject` now supports `fontFamily`, `fontStyle`, and `align`; Properties panel adds font family/size, bold/italic, and alignment controls.
- Copy / paste: `Ctrl+C` copies selected objects to an in-memory clipboard, `Ctrl+V` pastes cloned objects offset by (20, 20) and selects the pasted set; supports groups and multiple selections.
- SVG vector export: toolbar "Export SVG" button generates true SVG from active slide objects (rect, circle, text, line, arrow, image, path, group) with proper transforms, markers, and multi-line text; downloads as `<slide-name>.svg`.
- Freehand pen tool: toolbar "Pen (P)" button and `P` shortcut; mouse drag creates a `PathObject` with normalized SVG path data; supports selection, transform, layers, grouping, undo/redo, persistence, and SVG export.
- BioRender-style UI reorganization v3: minimal dark top header with brand + global actions; left sidebar uses a two-level navigation where a narrow vertical category list (Select / Shapes / Lines / Text / Draw / Library) reveals tools or the icon library in the wider right-hand panel; right-side Properties / Layers / Slides tabs; central canvas. Drawing-tool clicks on existing objects now select the object instead of drawing on top.
- BioRender-style scientific icon library: categories grid with 15 top-level scientific categories (Cell Types, Proteins, Nucleic Acids, Human Anatomy, Lab and Objects, Species, Agriculture, Membranes, Cell Structures, Epithelium, Lipids and Carbs, Chemistry, Graphs and Symbols, Arrows and Shapes, Biomoji), nested subcategories, searchable preset icons rendered as `Konva.Path`, and Back navigation.
- Dynamic icon loading: icon presets moved from a single TypeScript array into per-category JSON files under `src/data/icons/`; categories are lazy-loaded via Vite dynamic imports to keep the main bundle smaller as the library grows.
- SVG importer developer tool: a modal in the Library panel parses pasted SVG markup, extracts path data and viewBox dimensions, lets the user assign category/subcategory/name/id, previews the icon, and emits a JSON snippet ready to paste into the appropriate `src/data/icons/<category>.json` source file.
- SVG importer handles Inkscape exports: parses inline `style="fill:..."` / `stroke:...` / `stroke-width:...`, accumulates ancestor `<g transform="translate(...)">` offsets, normalizes translated paths to the origin, and fixes bbox inflation from relative initial moves.
- Drag alignment guide cleanup: `snapDrag` now emits at most one vertical and one horizontal guide (the closest match on each axis), preventing a dense web of dashed lines when dragging near many objects.

## In Progress
- Deciding the next MVP feature after the icon library pass (e.g., sourcing/creating SVG icon content, bezier curves / custom shapes, PDF export, color picker popover, or project JSON import/export).

## What's Left
- User gallery/auth (post-MVP).
- Backend persistence (post-MVP).

## Known Issues
- Inline text double-click activation relies on Konva's `dblclick` event and a 300ms custom double-click fallback in `Shape.tsx`; automated synthetic events don't trigger it, but manual user double-clicks should.
- Vite dev HMR can leave multiple Zustand store instances in memory, so automated console probes or dynamic imports of the store module may see stale/empty state even though the React UI uses the authoritative store instance. Use a production build/preview for reliable automated verification of store-dependent features.

## Recent Fixes
- SVG importer Inkscape compatibility: previous parser only read direct XML attributes, missed colors in inline `style`, and ignored `<g transform="translate(...)">` offsets. Now parses style attributes, accumulates group translate offsets, and normalizes path data to the visual origin. Fixed inflated bbox caused by relative initial moves staying at local (0,0).
- Grid rendering: previous single Konva `Line` with concatenated points produced diagonal connecting lines; now renders separate vertical and horizontal `Line` nodes for a regular grid.
- Text creation/edit flow: text tool now creates a text object on mouseup (instead of mousedown) and immediately enters inline editing; select tool double-click on a text object enters inline editing via both Konva `onDblClick` and a custom 300ms double-click detector.
