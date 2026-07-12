# Project Brief: SciRender

## Vision
Build a web-based scientific illustration editor similar to BioRender, enabling researchers to create publication-ready figures using a vector canvas, searchable icon library, templates, and export capabilities.

## Core Requirements
- Browser-first editor; no install required.
- Infinite/resizeable canvas with zoom, pan, grid, rulers, and alignment guides.
- Multi-slide support (like BioRender slides panel).
- Toolbar for shapes, text, lines, and images.
- Icon/template library with categories and search.
- Export to PNG/SVG/PDF.
- User files/gallery with folders and sharing (future).
- AI-assisted features are out of scope for MVP.

## Success Criteria (MVP)
A user can open the app, add shapes/text to a canvas, arrange them with snapping/alignment, switch between slides, export a high-resolution PNG, and control common actions via keyboard shortcuts. Image support, icon library, and backend gallery are post-MVP.

## Selected Tech Stack
React + TypeScript + Vite + react-konva/Konva + Zustand.

## Current Status
MVP canvas editor, object tools, alignment/snapping, multi-slide panel, export, and keyboard shortcuts are implemented and building successfully.
