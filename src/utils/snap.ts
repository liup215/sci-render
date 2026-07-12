import type { CanvasObject } from '../types';

export interface SnapResult {
  x: number;
  y: number;
  guides: { orientation: 'vertical' | 'horizontal'; value: number }[];
}

export function getBounds(obj: CanvasObject) {
  switch (obj.type) {
    case 'rect':
      return { minX: obj.x, maxX: obj.x + obj.width, minY: obj.y, maxY: obj.y + obj.height };
    case 'circle':
      return { minX: obj.x - obj.radius, maxX: obj.x + obj.radius, minY: obj.y - obj.radius, maxY: obj.y + obj.radius };
    case 'text':
      return { minX: obj.x, maxX: obj.x + (obj.width ?? obj.text.length * obj.fontSize * 0.6), minY: obj.y, maxY: obj.y + obj.fontSize };
    case 'line':
    case 'arrow': {
      const xs = obj.points.filter((_, i) => i % 2 === 0);
      const ys = obj.points.filter((_, i) => i % 2 === 1);
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
    }
    case 'image':
      return { minX: obj.x, maxX: obj.x + obj.width, minY: obj.y, maxY: obj.y + obj.height };
    case 'path': {
      const sx = obj.scaleX ?? 1;
      const sy = obj.scaleY ?? 1;
      return { minX: obj.x, maxX: obj.x + obj.width * sx, minY: obj.y, maxY: obj.y + obj.height * sy };
    }
    case 'group': {
      const sx = obj.scaleX ?? 1;
      const sy = obj.scaleY ?? 1;
      return { minX: obj.x, maxX: obj.x + obj.width * sx, minY: obj.y, maxY: obj.y + obj.height * sy };
    }
  }
}

function getCenter(obj: CanvasObject) {
  const b = getBounds(obj);
  return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
}

export function snapDrag(
  moving: CanvasObject,
  dx: number,
  dy: number,
  others: CanvasObject[],
  gridSize: number,
  threshold = 5
): SnapResult {
  const mb = getBounds(moving);
  const startCenter = getCenter(moving);
  const targetCenter = { x: startCenter.x + dx, y: startCenter.y + dy };

  let snapDx = dx;
  let snapDy = dy;
  const guides: { orientation: 'vertical' | 'horizontal'; value: number }[] = [];

  // Snap to grid
  if (gridSize > 0) {
    const gridSnapX = Math.round((moving.x + dx) / gridSize) * gridSize - (moving.x + dx);
    const gridSnapY = Math.round((moving.y + dy) / gridSize) * gridSize - (moving.y + dy);
    if (Math.abs(gridSnapX) <= threshold) snapDx += gridSnapX;
    if (Math.abs(gridSnapY) <= threshold) snapDy += gridSnapY;
  }

  // Snap to other objects: edges and centers
  const movingEdges = {
    minX: mb.minX + snapDx,
    maxX: mb.maxX + snapDx,
    centerX: targetCenter.x,
    minY: mb.minY + snapDy,
    maxY: mb.maxY + snapDy,
    centerY: targetCenter.y,
  };

  for (const other of others) {
    if (other.id === moving.id) continue;
    const ob = getBounds(other);
    const oc = getCenter(other);

    const candidates = [
      { axis: 'x' as const, value: movingEdges.minX, target: ob.minX },
      { axis: 'x' as const, value: movingEdges.maxX, target: ob.maxX },
      { axis: 'x' as const, value: movingEdges.centerX, target: oc.x },
      { axis: 'y' as const, value: movingEdges.minY, target: ob.minY },
      { axis: 'y' as const, value: movingEdges.maxY, target: ob.maxY },
      { axis: 'y' as const, value: movingEdges.centerY, target: oc.y },
    ];

    for (const c of candidates) {
      const diff = c.target - c.value;
      if (Math.abs(diff) <= threshold) {
        if (c.axis === 'x') {
          snapDx += diff;
          guides.push({ orientation: 'vertical', value: c.target });
        } else {
          snapDy += diff;
          guides.push({ orientation: 'horizontal', value: c.target });
        }
      }
    }
  }

  return { x: snapDx, y: snapDy, guides };
}

export type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export function alignObjects(
  objects: CanvasObject[],
  align: AlignMode
): Map<string, { dx: number; dy: number }> {
  const result = new Map<string, { dx: number; dy: number }>();
  if (objects.length < 2) return result;

  const bounds = objects.map(getBounds);

  let targetValue = 0;
  switch (align) {
    case 'left':
      targetValue = Math.min(...bounds.map((b) => b.minX));
      break;
    case 'right':
      targetValue = Math.max(...bounds.map((b) => b.maxX));
      break;
    case 'center':
      targetValue =
        bounds.map((b) => (b.minX + b.maxX) / 2).reduce((a, b) => a + b, 0) / bounds.length;
      break;
    case 'top':
      targetValue = Math.min(...bounds.map((b) => b.minY));
      break;
    case 'bottom':
      targetValue = Math.max(...bounds.map((b) => b.maxY));
      break;
    case 'middle':
      targetValue =
        bounds.map((b) => (b.minY + b.maxY) / 2).reduce((a, b) => a + b, 0) / bounds.length;
      break;
  }

  for (const obj of objects) {
    const b = getBounds(obj);
    let dx = 0;
    let dy = 0;
    if (align === 'left') {
      dx = targetValue - b.minX;
    } else if (align === 'right') {
      dx = targetValue - b.maxX;
    } else if (align === 'center') {
      const centerX = (b.minX + b.maxX) / 2;
      dx = targetValue - centerX;
    } else if (align === 'top') {
      dy = targetValue - b.minY;
    } else if (align === 'bottom') {
      dy = targetValue - b.maxY;
    } else if (align === 'middle') {
      const centerY = (b.minY + b.maxY) / 2;
      dy = targetValue - centerY;
    }
    result.set(obj.id, { dx, dy });
  }

  return result;
}
