import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasObject, GroupObject, Slide, Tool, CanvasSize } from '../types';
import { alignObjects, getBounds, type AlignMode, type SnapResult } from '../utils/snap';

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
  groupSelected: () => void;
  ungroupSelected: () => void;
  setGuides: (guides: SnapResult['guides']) => void;
  resetSession: () => void;
}

const createBlankSlide = (name = 'Slide 1'): Slide => ({
  id: uuidv4(),
  name,
  objects: [],
});

const initialSlide = createBlankSlide();

function cloneObject(obj: CanvasObject, dx: number, dy: number): CanvasObject {
  const id = uuidv4();
  if (obj.type === 'line' || obj.type === 'arrow') {
    return {
      ...obj,
      id,
      points: obj.points.map((p, i) => p + (i % 2 === 0 ? dx : dy)),
    } as CanvasObject;
  }
  if (obj.type === 'group') {
    return {
      ...obj,
      id,
      x: obj.x + dx,
      y: obj.y + dy,
      children: obj.children.map((c) => cloneObject(c, 0, 0)),
    } as CanvasObject;
  }
  if (obj.type === 'path') {
    return { ...obj, id, x: obj.x + dx, y: obj.y + dy } as CanvasObject;
  }
  return { ...obj, id, x: obj.x + dx, y: obj.y + dy } as CanvasObject;
}

function transformPoint(
  x: number,
  y: number,
  rotation: number,
  scaleX: number,
  scaleY: number
) {
  const sx = x * scaleX;
  const sy = y * scaleY;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: sx * cos - sy * sin, y: sx * sin + sy * cos };
}

function transformObject(
  obj: CanvasObject,
  gx: number,
  gy: number,
  rotation: number,
  scaleX: number,
  scaleY: number
): CanvasObject {
  const childRotation = (obj.rotation ?? 0) + rotation;

  if (obj.type === 'line' || obj.type === 'arrow') {
    const points: number[] = [];
    for (let i = 0; i < obj.points.length; i += 2) {
      const p = transformPoint(obj.points[i], obj.points[i + 1], rotation, scaleX, scaleY);
      points.push(gx + p.x, gy + p.y);
    }
    return { ...obj, x: 0, y: 0, points, rotation: childRotation };
  }

  if (obj.type === 'group') {
    const p = transformPoint(obj.x, obj.y, rotation, scaleX, scaleY);
    const nextScaleX = (obj.scaleX ?? 1) * scaleX;
    const nextScaleY = (obj.scaleY ?? 1) * scaleY;
    return {
      ...obj,
      x: gx + p.x,
      y: gy + p.y,
      scaleX: nextScaleX,
      scaleY: nextScaleY,
      rotation: childRotation,
      children: obj.children.map((c) =>
        transformObject(c, gx + p.x, gy + p.y, childRotation, nextScaleX, nextScaleY)
      ),
    };
  }

  const p = transformPoint(obj.x, obj.y, rotation, scaleX, scaleY);
  const absX = gx + p.x;
  const absY = gy + p.y;

  if (obj.type === 'rect' || obj.type === 'image') {
    return { ...obj, x: absX, y: absY, width: obj.width * scaleX, height: obj.height * scaleY, rotation: childRotation };
  }
  if (obj.type === 'path') {
    return { ...obj, x: absX, y: absY, width: obj.width * scaleX, height: obj.height * scaleY, scaleX: 1, scaleY: 1, rotation: childRotation };
  }
  if (obj.type === 'circle') {
    return { ...obj, x: absX, y: absY, radius: obj.radius * Math.max(scaleX, scaleY), rotation: childRotation };
  }
  return {
    ...obj,
    x: absX,
    y: absY,
    width: (obj.width ?? 0) * scaleX,
    fontSize: obj.fontSize * ((scaleX + scaleY) / 2),
    rotation: childRotation,
  };
}

function flattenGroup(group: GroupObject): CanvasObject[] {
  const gx = group.x;
  const gy = group.y;
  const rotation = group.rotation ?? 0;
  const scaleX = group.scaleX ?? 1;
  const scaleY = group.scaleY ?? 1;
  return group.children.map((child) => transformObject(child, gx, gy, rotation, scaleX, scaleY));
}

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
      const clone = cloneObject(obj, 20, 20);
      newObjects.push(clone);
      newIds.push(clone.id);
    }
    set({
      slides: slides.map((s) =>
        s.id === activeSlideId ? { ...s, objects: [...s.objects, ...newObjects] } : s
      ),
      selectedIds: newIds,
    });
  },

  groupSelected: () => {
    const { slides, activeSlideId, selectedIds } = get();
    if (!activeSlideId || selectedIds.length < 2) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const selected = slide.objects.filter((o) => selectedIds.includes(o.id));
    if (selected.length < 2 || selected.some((o) => o.type === 'group')) return;

    const bounds = selected.map(getBounds);
    const minX = Math.min(...bounds.map((b) => b.minX));
    const minY = Math.min(...bounds.map((b) => b.minY));
    const maxX = Math.max(...bounds.map((b) => b.maxX));
    const maxY = Math.max(...bounds.map((b) => b.maxY));

    const children: CanvasObject[] = selected.map((o) => {
      if (o.type === 'line' || o.type === 'arrow') {
        return {
          ...o,
          points: (o.points as number[]).map((p, i) => p - (i % 2 === 0 ? minX : minY)),
        } as CanvasObject;
      }
      return { ...o, x: o.x - minX, y: o.y - minY } as CanvasObject;
    });

    const group: CanvasObject = {
      id: uuidv4(),
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      children,
    };

    set({
      slides: slides.map((s) =>
        s.id === activeSlideId
          ? { ...s, objects: [...s.objects.filter((o) => !selectedIds.includes(o.id)), group] }
          : s
      ),
      selectedIds: [group.id],
    });
  },

  ungroupSelected: () => {
    const { slides, activeSlideId, selectedIds } = get();
    if (!activeSlideId || selectedIds.length === 0) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;

    const groupsToUngroup: GroupObject[] = [];
    for (const id of selectedIds) {
      const obj = slide.objects.find((o) => o.id === id);
      if (obj && obj.type === 'group') groupsToUngroup.push(obj);
    }
    if (groupsToUngroup.length === 0) return;

    const flattened: CanvasObject[] = [];
    for (const group of groupsToUngroup) {
      flattened.push(...flattenGroup(group));
    }

    const groupIds = new Set(groupsToUngroup.map((g) => g.id));
    const nextSelected = selectedIds.flatMap((id) => {
      const obj = slide.objects.find((o) => o.id === id);
      if (obj && obj.type === 'group' && groupIds.has(obj.id)) {
        return obj.children.map((c) => c.id);
      }
      return id;
    });

    set({
      slides: slides.map((s) =>
        s.id === activeSlideId
          ? { ...s, objects: [...s.objects.filter((o) => !groupIds.has(o.id)), ...flattened] }
          : s
      ),
      selectedIds: nextSelected,
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
