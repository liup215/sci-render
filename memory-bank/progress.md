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

## In Progress
- Deciding next feature: local persistence vs. shape-library expansion.

## What's Left
- Local persistence (localStorage/IndexedDB) so work survives reloads.
- Rulers UI (optional).
- Icon/template library (post-MVP).
- User gallery/auth (post-MVP).
- Backend persistence (post-MVP).

## Known Issues
- None critical.
- Ruler UI and image objects are stubbed in state/types but not yet implemented.
