import { useRef, useState, useEffect } from 'react';
import { Rect, Circle, Text, Line, Arrow, Image, Group } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasObject } from '../types';
import { useEditorStore } from '../store/useEditorStore';
import { snapDrag } from '../utils/snap';

interface ShapeProps {
  object: CanvasObject;
  isSelected: boolean;
  interactive?: boolean;
}

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 6;

function useImage(src: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);
  return image;
}

export function Shape({ object, isSelected, interactive = true }: ShapeProps) {
  const image = useImage(object.type === 'image' ? object.src : undefined);
  const tool = useEditorStore((s) => s.tool);
  const updateObject = useEditorStore((s) => s.updateObject);
  const setSelectedIds = useEditorStore((s) => s.setSelectedIds);
  const toggleSelectedId = useEditorStore((s) => s.toggleSelectedId);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setGuides = useEditorStore((s) => s.setGuides);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const objects = useEditorStore(
    (s) => s.slides.find((slide) => slide.id === activeSlideId)?.objects ?? []
  );

  const startPosRef = useRef({ x: object.x, y: object.y });

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!interactive) return;
    e.cancelBubble = true;
    if (tool !== 'select') return;
    if (e.evt.shiftKey) {
      toggleSelectedId(object.id);
    } else {
      setSelectedIds([object.id]);
    }
  };

  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!interactive) return;
    e.cancelBubble = true;
    if (object.type === 'text') {
      const next = window.prompt('Edit text', object.text);
      if (next !== null) {
        updateObject(object.id, { text: next });
      }
    }
  };

  const handleDragStart = () => {
    startPosRef.current = { x: object.x, y: object.y };
    if (tool === 'select' && !isSelected) {
      setSelectedIds([object.id]);
    }
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    if (tool !== 'select') {
      node.position(startPosRef.current);
      return;
    }

    let x = node.x();
    let y = node.y();

    if (snapEnabled) {
      const dx = x - startPosRef.current.x;
      const dy = y - startPosRef.current.y;
      const others = objects.filter((o) => o.id !== object.id);
      const result = snapDrag(object, dx, dy, others, GRID_SIZE, SNAP_THRESHOLD);
      x = startPosRef.current.x + result.x;
      y = startPosRef.current.y + result.y;
      node.position({ x, y });
      setGuides(result.guides);
    } else {
      setGuides([]);
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setGuides([]);

    if (object.type === 'line' || object.type === 'arrow') {
      // Convert node offset back into absolute points
      const dx = node.x();
      const dy = node.y();
      if (dx !== 0 || dy !== 0) {
        updateObject(object.id, {
          points: object.points.map((p, i) => p + (i % 2 === 0 ? dx : dy)),
          x: 0,
          y: 0,
        });
        node.position({ x: 0, y: 0 });
      }
      return;
    }

    updateObject(object.id, { x: node.x(), y: node.y() });
  };

  const draggable = interactive && tool === 'select';

  switch (object.type) {
    case 'rect':
      return (
        <Rect
          id={object.id}
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          rotation={object.rotation ?? 0}
          draggable={draggable}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      );
    case 'circle':
      return (
        <Circle
          id={object.id}
          x={object.x}
          y={object.y}
          radius={object.radius}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          rotation={object.rotation ?? 0}
          draggable={draggable}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      );
    case 'text':
      return (
        <Text
          id={object.id}
          x={object.x}
          y={object.y}
          text={object.text}
          fontSize={object.fontSize}
          fill={object.fill}
          width={object.width}
          rotation={object.rotation ?? 0}
          draggable={draggable}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      );
    case 'line':
      return (
        <Line
          id={object.id}
          x={object.x}
          y={object.y}
          points={object.points}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          rotation={object.rotation ?? 0}
          draggable={draggable}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          hitStrokeWidth={Math.max(object.strokeWidth, 8)}
        />
      );
    case 'arrow':
      return (
        <Arrow
          id={object.id}
          x={object.x}
          y={object.y}
          points={object.points}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          fill={object.fill}
          pointerLength={object.pointerLength}
          pointerWidth={object.pointerWidth}
          pointerAtEnding={object.pointerAtEnding}
          pointerAtBeginning={object.pointerAtBeginning}
          rotation={object.rotation ?? 0}
          draggable={draggable}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          hitStrokeWidth={Math.max(object.strokeWidth, 8)}
        />
      );
    case 'image':
      if (!image) return null;
      return (
        <Image
          id={object.id}
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          image={image}
          rotation={object.rotation ?? 0}
          draggable={draggable}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      );
    case 'group':
      return (
        <Group
          id={object.id}
          x={object.x}
          y={object.y}
          width={object.width}
          height={object.height}
          rotation={object.rotation ?? 0}
          scaleX={object.scaleX ?? 1}
          scaleY={object.scaleY ?? 1}
          draggable={draggable}
          onClick={handleClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          {object.children.map((child) => (
            <Shape key={child.id} object={child} isSelected={false} interactive={false} />
          ))}
        </Group>
      );
  }
}
