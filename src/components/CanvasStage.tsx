import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Transformer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '../store/useEditorStore';
import { Shape } from './Shape';
import type { CanvasObject, RectObject, CircleObject, TextObject, LineObject, ArrowObject } from '../types';

const GRID_SIZE = 20;

export function CanvasStage() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    slides,
    activeSlideId,
    selectedIds,
    tool,
    zoom,
    stagePos,
    canvasSize,
    canvasColor,
    gridVisible,
    guides,
    addObject,
    updateObject,
    setSelectedIds,
    clearSelection,
    setZoom,
    setStagePos,
    deleteObjects,
  } = useEditorStore();

  const activeSlide = slides.find((s) => s.id === activeSlideId);
  const objects = activeSlide?.objects ?? [];

  const [size, setSize] = useState({ width: 800, height: 600 });
  const [drawing, setDrawing] = useState<{
    start: { x: number; y: number };
    current: { x: number; y: number };
    tempId: string | null;
  } | null>(null);
  const drawingRef = useRef(drawing);
  const setDrawingRef = useCallback(
    (value: typeof drawing | null) => {
      drawingRef.current = value;
      setDrawing(value);
    },
    []
  );
  useEffect(() => {
    drawingRef.current = drawing;
  }, [drawing]);
  const [spacePressed, setSpacePressed] = useState(false);
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!stage || !transformer) return;

    const nodes: Konva.Node[] = [];
    for (const id of selectedIds) {
      const node = stage.findOne('#' + id);
      if (node) nodes.push(node);
    }
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, objects.length]);

  // Dev-only helpers for manual testing from the browser console.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const stage = stageRef.current;
    if (stage) {
      (window as unknown as { sciRenderStage?: Konva.Stage }).sciRenderStage = stage;
    }
    (window as unknown as { sciRenderStore?: typeof useEditorStore }).sciRenderStore = useEditorStore;
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const exportHandler = () => {
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${activeSlide?.name ?? 'untitled'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.addEventListener('sci-render:export', exportHandler);
    return () => window.removeEventListener('sci-render:export', exportHandler);
  }, [activeSlide?.name]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(true);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        deleteObjects();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePressed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [selectedIds, deleteObjects]);

  const getPointerStagePos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return stage.getAbsoluteTransform().copy().invert().point(pointer);
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.max(0.1, Math.min(5, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    };

    setZoom(clamped);
    setStagePos(newPos);
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const clickedOnEmpty = e.target === stage || e.target.name() === 'canvas-bg';
    const pos = getPointerStagePos();

    if (spacePressed) {
      setPanning(true);
      panStart.current = { x: pos.x, y: pos.y };
      return;
    }

    if (tool === 'select') {
      if (clickedOnEmpty) {
        if (!e.evt.shiftKey) clearSelection();
        setDrawingRef({ start: pos, current: pos, tempId: null });
      }
      return;
    }

    // Start creating a shape
    if (tool === 'text') {
      const textObj: TextObject = {
        id: uuidv4(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Double click to edit',
        fontSize: 20,
        fill: '#000000',
        draggable: true,
      };
      addObject(textObj);
      return;
    }

    setDrawingRef({ start: pos, current: pos, tempId: uuidv4() });
  };

  const handleMouseMove = (_e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = getPointerStagePos();

    if (panning && spacePressed) {
      const dx = pos.x - panStart.current.x;
      const dy = pos.y - panStart.current.y;
      setStagePos({ x: stagePos.x + dx * zoom, y: stagePos.y + dy * zoom });
      return;
    }

    const d = drawingRef.current;
    if (d) {
      setDrawingRef({ ...d, current: pos });
    }

    if (tool !== 'select' && tool !== 'text' && d?.tempId) {
      // Update temporary shape on the fly
      const existing = objects.find((o) => o.id === d.tempId);
      if (existing) {
        const updated = buildShapeFromDraw(tool, d.start, pos, d.tempId);
        updateObject(d.tempId, updated);
      }
    }
  };

  const handleMouseUp = () => {
    if (panning) {
      setPanning(false);
      return;
    }

    const d = drawingRef.current;
    if (!d) return;
    const { start, current, tempId } = d;
    setDrawingRef(null);

    if (tool === 'select') {
      // Select objects inside drag rectangle
      const x1 = Math.min(start.x, current.x);
      const x2 = Math.max(start.x, current.x);
      const y1 = Math.min(start.y, current.y);
      const y2 = Math.max(start.y, current.y);
      const inside = objects
        .filter((o) => {
          const cx =
            o.type === 'circle'
              ? o.x
              : o.x + (o.type === 'rect' ? o.width / 2 : o.type === 'image' ? o.width / 2 : 0);
          const cy =
            o.type === 'circle'
              ? o.y
              : o.y + (o.type === 'rect' ? o.height / 2 : o.type === 'image' ? o.height / 2 : 0);
          // Simple center-point selection for text/line
          if (o.type === 'text') return o.x >= x1 && o.x <= x2 && o.y >= y1 && o.y <= y2;
          if (o.type === 'line' || o.type === 'arrow') {
            const xs = o.points.filter((_, i) => i % 2 === 0);
            const ys = o.points.filter((_, i) => i % 2 === 1);
            const lx = xs.reduce((a, b) => a + b, 0) / xs.length;
            const ly = ys.reduce((a, b) => a + b, 0) / ys.length;
            return lx >= x1 && lx <= x2 && ly >= y1 && ly <= y2;
          }
          return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
        })
        .map((o) => o.id);
      setSelectedIds(inside);
      return;
    }

    if (tool === 'text') return;

    const shape = buildShapeFromDraw(tool, start, current, tempId ?? uuidv4());
    if (isShapeVisible(shape)) {
      if (tempId && objects.some((o) => o.id === tempId)) {
        updateObject(tempId, shape);
        setSelectedIds([tempId]);
      } else {
        addObject(shape);
      }
    } else if (tempId) {
      deleteObjects([tempId]);
    }
  };

  const handleTransformEnd = () => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    for (const node of transformer.nodes()) {
      const id = node.id();
      const obj = objects.find((o) => o.id === id);
      if (!obj) continue;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();
      const x = node.x();
      const y = node.y();

      if (obj.type === 'rect') {
        updateObject(id, {
          x,
          y,
          width: Math.max(5, obj.width * scaleX),
          height: Math.max(5, obj.height * scaleY),
          rotation,
        });
      } else if (obj.type === 'circle') {
        updateObject(id, {
          x,
          y,
          radius: Math.max(2, obj.radius * Math.max(scaleX, scaleY)),
          rotation,
        });
      } else if (obj.type === 'text') {
        updateObject(id, {
          x,
          y,
          fontSize: Math.max(8, obj.fontSize * Math.max(scaleX, scaleY)),
          rotation,
        });
      } else if (obj.type === 'line' || obj.type === 'arrow') {
        // Apply scale to points relative to origin
        updateObject(id, {
          points: obj.points.map((p, i) => p * (i % 2 === 0 ? scaleX : scaleY)),
          rotation,
        });
      } else if (obj.type === 'image') {
        updateObject(id, {
          x,
          y,
          width: Math.max(5, obj.width * scaleX),
          height: Math.max(5, obj.height * scaleY),
          rotation,
        });
      }

      node.scaleX(1);
      node.scaleY(1);
    }
  };

  // Grid lines within visible area plus padding
  const gridLines: number[] = [];
  if (gridVisible) {
    const startX = Math.floor((-stagePos.x / zoom) / GRID_SIZE) * GRID_SIZE;
    const endX = startX + (size.width / zoom) + GRID_SIZE * 2;
    const startY = Math.floor((-stagePos.y / zoom) / GRID_SIZE) * GRID_SIZE;
    const endY = startY + (size.height / zoom) + GRID_SIZE * 2;

    for (let x = startX; x <= endX; x += GRID_SIZE) {
      gridLines.push(x, startY, x, endY);
    }
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      gridLines.push(startX, y, endX, y);
    }
  }

  const selectionRect = drawing && tool === 'select'
    ? {
        x: Math.min(drawing.start.x, drawing.current.x),
        y: Math.min(drawing.start.y, drawing.current.y),
        width: Math.abs(drawing.current.x - drawing.start.x),
        height: Math.abs(drawing.current.y - drawing.start.y),
      }
    : null;

  const cursor = panning
    ? 'grabbing'
    : spacePressed
      ? 'grab'
      : tool === 'select'
        ? 'default'
        : 'crosshair';

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#f4f4f5', overflow: 'hidden', cursor }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={zoom}
        scaleY={zoom}
        draggable={false}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Layer>
          <Rect
            name="canvas-bg"
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill={canvasColor}
            listening={false}
          />
          {gridVisible && (
            <Line
              points={gridLines}
              stroke="#e4e4e7"
              strokeWidth={1 / zoom}
              listening={false}
            />
          )}
          {selectionRect && (
            <Rect
              {...selectionRect}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1 / zoom}
              dash={[4 / zoom, 4 / zoom]}
              listening={false}
            />
          )}
          {guides.map((g) => (
            <Line
              key={g.orientation + g.value}
              points={
                g.orientation === 'vertical'
                  ? [g.value, -10000, g.value, 10000]
                  : [-10000, g.value, 10000, g.value]
              }
              stroke="#3b82f6"
              strokeWidth={1 / zoom}
              dash={[4 / zoom, 4 / zoom]}
              listening={false}
            />
          ))}
        </Layer>

        <Layer>
          {objects.map((obj) => (
            <Shape key={obj.id} object={obj} isSelected={selectedIds.includes(obj.id)} />
          ))}
          {drawing && drawing.tempId && tool !== 'select' && tool !== 'text' && (
            <PreviewShape
              tool={tool}
              start={drawing.start}
              current={drawing.current}
            />
          )}
          <Transformer
            ref={transformerRef}
            onTransformEnd={handleTransformEnd}
            anchorSize={10}
            anchorCornerRadius={2}
            rotateAnchorOffset={20}
            borderStroke="#3b82f6"
            anchorStroke="#3b82f6"
            anchorFill="#ffffff"
          />
        </Layer>
      </Stage>
    </div>
  );
}

function buildShapeFromDraw(
  tool: 'rect' | 'circle' | 'line' | 'arrow',
  start: { x: number; y: number },
  current: { x: number; y: number },
  id: string
): CanvasObject {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  switch (tool) {
    case 'rect':
      return {
        id,
        type: 'rect',
        x,
        y,
        width,
        height,
        fill: '#60a5fa',
        stroke: '#2563eb',
        strokeWidth: 2,
        draggable: true,
      } as RectObject;
    case 'circle': {
      const radius = Math.max(width, height) / 2;
      return {
        id,
        type: 'circle',
        x: start.x + (current.x - start.x) / 2,
        y: start.y + (current.y - start.y) / 2,
        radius,
        fill: '#34d399',
        stroke: '#059669',
        strokeWidth: 2,
        draggable: true,
      } as CircleObject;
    }
    case 'line':
      return {
        id,
        type: 'line',
        x: 0,
        y: 0,
        points: [start.x, start.y, current.x, current.y],
        stroke: '#1f2937',
        strokeWidth: 3,
        draggable: true,
      } as LineObject;
    case 'arrow':
      return {
        id,
        type: 'arrow',
        x: 0,
        y: 0,
        points: [start.x, start.y, current.x, current.y],
        stroke: '#1f2937',
        strokeWidth: 3,
        pointerLength: 12,
        pointerWidth: 12,
        pointerAtEnding: true,
        pointerAtBeginning: false,
        fill: '#1f2937',
        draggable: true,
      } as ArrowObject;
  }
}

function isShapeVisible(obj: CanvasObject): boolean {
  if (obj.type === 'line' || obj.type === 'arrow') {
    const p = obj.points;
    return Math.abs(p[0] - p[2]) > 2 || Math.abs(p[1] - p[3]) > 2;
  }
  if (obj.type === 'circle') return obj.radius > 2;
  if (obj.type === 'rect') return obj.width > 5 && obj.height > 5;
  return true;
}

function PreviewShape({
  tool,
  start,
  current,
}: {
  tool: 'rect' | 'circle' | 'line' | 'arrow';
  start: { x: number; y: number };
  current: { x: number; y: number };
}) {
  const shape = buildShapeFromDraw(tool, start, current, 'preview');
  if (!isShapeVisible(shape)) return null;
  return <Shape object={shape} isSelected={false} />;
}
