import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasObject, Slide, Tool, CanvasSize } from '../types';
import { alignObjects, type AlignMode, type SnapResult } from '../utils/snap';

export interface EditorState {
  slides: Slide[];
  activeSlideId: string | null;
  selectedIds: string[];
  tool: Tool;
  zoom: number;
  stagePos: { x: number; y: number };
  canvasSize: CanvasSize;
  canvasColor: string;
  gridVisible: boolean;
  rulersVisible: boolean;
  snapEnabled: boolean;
  guides: SnapResult['guides'];
}

interface EditorActions {
  setTool: (tool: Tool) => void;
  addSlide: () => void;
  setActiveSlide: (id: string) => void;
  deleteSlide: (id: string) => void;
  renameSlide: (id: string, name: string) => void;
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  deleteObjects: (ids?: string[]) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelection: () => void;
  setZoom: (zoom: number) => void;
  setStagePos: (pos: { x: number; y: number }) => void;
  setCanvasSize: (size: CanvasSize) => void;
  setCanvasColor: (color: string) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  moveObjects: (dx: number, dy: number) => void;
  alignSelected: (align: AlignMode) => void;
  selectAll: () => void;
  duplicateSelected: () => void;
  setGuides: (guides: SnapResult['guides']) => void;
  resetSession: () => void;
}

const createBlankSlide = (name = 'Slide 1'): Slide => ({
  id: uuidv4(),
  name,
  objects: [],
});

const initialSlide = createBlankSlide();

const defaultState: EditorState = {
  slides: [initialSlide],
  activeSlideId: initialSlide.id,
  selectedIds: [],
  tool: 'select',
  zoom: 1,
  stagePos: { x: 0, y: 0 },
  canvasSize: { width: 800, height: 600 },
  canvasColor: '#ffffff',
  gridVisible: true,
  rulersVisible: false,
  snapEnabled: true,
  guides: [],
};

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set, get) => ({
      ...defaultState,

  setTool: (tool) => set({ tool, selectedIds: tool !== 'select' ? [] : get().selectedIds, guides: [] }),

  addSlide: () => {
    const newSlide = createBlankSlide(`Slide ${get().slides.length + 1}`);
    set({ slides: [...get().slides, newSlide], activeSlideId: newSlide.id, selectedIds: [] });
  },

  setActiveSlide: (id) => set({ activeSlideId: id, selectedIds: [] }),

  deleteSlide: (id) => {
    const { slides, activeSlideId } = get();
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((s) => s.id !== id);
    const nextActive = activeSlideId === id ? nextSlides[0].id : activeSlideId;
    set({ slides: nextSlides, activeSlideId: nextActive, selectedIds: [] });
  },

  renameSlide: (id, name) => {
    set({
      slides: get().slides.map((s) => (s.id === id ? { ...s, name } : s)),
    });
  },

  addObject: (obj) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId ? { ...s, objects: [...s.objects, obj] } : s
      ),
      selectedIds: [obj.id],
    });
  },

  updateObject: (id, patch) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              objects: s.objects.map((o) =>
                o.id === id ? ({ ...o, ...patch } as CanvasObject) : o
              ),
            }
          : s
      ),
    });
  },

  deleteObjects: (ids) => {
    const { slides, activeSlideId, selectedIds } = get();
    if (!activeSlideId) return;
    const toDelete = ids ?? selectedIds;
    if (toDelete.length === 0) return;
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId
          ? { ...s, objects: s.objects.filter((o) => !toDelete.includes(o.id)) }
          : s
      ),
      selectedIds: selectedIds.filter((id) => !toDelete.includes(id)),
    });
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  toggleSelectedId: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  clearSelection: () => set({ selectedIds: [] }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setStagePos: (pos) => set({ stagePos: pos }),

  setCanvasSize: (size) => set({ canvasSize: size }),

  setCanvasColor: (color) => set({ canvasColor: color }),

  toggleGrid: () => set({ gridVisible: !get().gridVisible }),

  toggleRulers: () => set({ rulersVisible: !get().rulersVisible }),

  toggleSnap: () => set({ snapEnabled: !get().snapEnabled }),

  moveObjects: (dx, dy) => {
    const { slides, activeSlideId, selectedIds } = get();
    if (!activeSlideId || selectedIds.length === 0) return;
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              objects: s.objects.map((o) => {
                if (!selectedIds.includes(o.id)) return o;
                if (o.type === 'line' || o.type === 'arrow') {
                  return { ...o, points: o.points.map((p, i) => p + (i % 2 === 0 ? dx : dy)) };
                }
                return { ...o, x: o.x + dx, y: o.y + dy };
              }),
            }
          : s
      ),
    });
  },

  alignSelected: (align) => {
    const { slides, activeSlideId, selectedIds } = get();
    if (!activeSlideId || selectedIds.length < 2) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const selected = slide.objects.filter((o) => selectedIds.includes(o.id));
    const deltas = alignObjects(selected, align);
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              objects: s.objects.map((o) => {
                const d = deltas.get(o.id);
                if (!d) return o;
                if (o.type === 'line' || o.type === 'arrow') {
                  return { ...o, points: o.points.map((p, i) => p + (i % 2 === 0 ? d.dx : d.dy)) };
                }
                return { ...o, x: o.x + d.dx, y: o.y + d.dy };
              }),
            }
          : s
      ),
    });
  },

  selectAll: () => {
    const { slides, activeSlideId } = get();
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    set({ selectedIds: slide.objects.map((o) => o.id) });
  },

  duplicateSelected: () => {
    const { slides, activeSlideId, selectedIds } = get();
    if (!activeSlideId || selectedIds.length === 0) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const newObjects: CanvasObject[] = [];
    const newIds: string[] = [];
    for (const id of selectedIds) {
      const obj = slide.objects.find((o) => o.id === id);
      if (!obj) continue;
      const newId = uuidv4();
      newIds.push(newId);
      if (obj.type === 'line' || obj.type === 'arrow') {
        newObjects.push({
          ...obj,
          id: newId,
          points: obj.points.map((p, i) => p + (i % 2 === 0 ? 20 : 20)),
        } as CanvasObject);
      } else {
        newObjects.push({ ...obj, id: newId, x: obj.x + 20, y: obj.y + 20 } as CanvasObject);
      }
    }
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId ? { ...s, objects: [...s.objects, ...newObjects] } : s
      ),
      selectedIds: newIds,
    });
  },

  setGuides: (guides) => set({ guides }),

  resetSession: () => {
    const slide = createBlankSlide();
    set({
      slides: [slide],
      activeSlideId: slide.id,
      selectedIds: [],
      tool: 'select',
      zoom: 1,
      stagePos: { x: 0, y: 0 },
      canvasSize: { width: 800, height: 600 },
      canvasColor: '#ffffff',
      gridVisible: true,
      rulersVisible: false,
      snapEnabled: true,
      guides: [],
    });
  },
}), {
  name: 'sci-render-storage',
  storage: createJSONStorage(() => localStorage),
})
);
