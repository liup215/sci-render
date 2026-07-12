import type {
  CanvasObject,
  CanvasSize,
  GroupObject,
  RectObject,
  CircleObject,
  TextObject,
  LineObject,
  ArrowObject,
  ImageObject,
  PathObject,
  Slide,
} from '../types';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function objectTransform(obj: CanvasObject): string {
  const rotation = obj.rotation ?? 0;
  const scaleX = (obj as { scaleX?: number }).scaleX ?? 1;
  const scaleY = (obj as { scaleY?: number }).scaleY ?? 1;
  let transform = `translate(${obj.x.toFixed(2)}, ${obj.y.toFixed(2)})`;
  if (rotation !== 0) {
    transform += ` rotate(${rotation.toFixed(2)})`;
  }
  if (scaleX !== 1 || scaleY !== 1) {
    transform += ` scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
  }
  return transform;
}

function renderArrowMarkers(): string {
  return `
    <defs>
      <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
      </marker>
      <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M9,0 L9,6 L0,3 z" fill="currentColor" />
      </marker>
    </defs>
  `;
}

function pointsAttr(points: number[]): string {
  return points.map((p) => p.toFixed(2)).join(' ');
}

function renderObject(obj: CanvasObject): string {
  const transform = objectTransform(obj);
  const attrs = transform ? `transform="${transform}"` : '';

  switch (obj.type) {
    case 'rect': {
      const r = obj as RectObject;
      return `<rect ${attrs} x="0" y="0" width="${r.width.toFixed(2)}" height="${r.height.toFixed(2)}" fill="${r.fill}" stroke="${r.stroke}" stroke-width="${r.strokeWidth}" />`;
    }
    case 'circle': {
      const c = obj as CircleObject;
      return `<circle ${attrs} cx="0" cy="0" r="${c.radius.toFixed(2)}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}" />`;
    }
    case 'text': {
      const t = obj as TextObject;
      const fontStyle = t.fontStyle ?? 'normal';
      const fontFamily = t.fontFamily ?? 'Arial';
      const anchor = t.align === 'center' ? 'middle' : t.align === 'right' ? 'end' : 'start';
      const widthAttr = t.width ? ` width="${t.width.toFixed(2)}"` : '';
      // Preserve whitespace and line breaks.
      const lines = escapeXml(t.text).split('\n');
      if (lines.length === 1) {
        return `<text ${attrs} x="0" y="0" font-family="${fontFamily}" font-size="${t.fontSize}" font-style="${fontStyle}" fill="${t.fill}" text-anchor="${anchor}" dominant-baseline="hanging"${widthAttr}>${lines[0]}</text>`;
      }
      const lineHeight = t.fontSize * 1.2;
      const tspans = lines
        .map((line, i) => `<tspan x="0" dy="${i === 0 ? '0' : lineHeight.toFixed(2)}">${line}</tspan>`)
        .join('');
      return `<text ${attrs} x="0" y="0" font-family="${fontFamily}" font-size="${t.fontSize}" font-style="${fontStyle}" fill="${t.fill}" text-anchor="${anchor}" dominant-baseline="hanging"${widthAttr}>${tspans}</text>`;
    }
    case 'line': {
      const l = obj as LineObject;
      return `<polyline ${attrs} points="${pointsAttr(l.points)}" fill="none" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
    }
    case 'arrow': {
      const a = obj as ArrowObject;
      const markerEnd = a.pointerAtEnding !== false ? ' marker-end="url(#arrow-end)"' : '';
      const markerStart = a.pointerAtBeginning ? ' marker-start="url(#arrow-start)"' : '';
      return `<polyline ${attrs} points="${pointsAttr(a.points)}" fill="none" stroke="${a.stroke}" stroke-width="${a.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${markerEnd}${markerStart} />`;
    }
    case 'image': {
      const img = obj as ImageObject;
      return `<image ${attrs} href="${img.src}" width="${img.width.toFixed(2)}" height="${img.height.toFixed(2)}" preserveAspectRatio="none" />`;
    }
    case 'path': {
      const p = obj as PathObject;
      return `<path ${attrs} d="${p.data}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" />`;
    }
    case 'group': {
      const g = obj as GroupObject;
      const children = g.children.map(renderObject).join('\n');
      return `<g ${attrs}>\n${children}\n</g>`;
    }
    default:
      return '';
  }
}

export function slideToSvg(slide: Slide, canvasSize: CanvasSize, canvasColor = '#ffffff'): string {
  const hasArrow = slide.objects.some((o) => o.type === 'arrow');
  const markers = hasArrow ? renderArrowMarkers() : '';
  const objects = slide.objects.map(renderObject).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvasSize.width}" height="${canvasSize.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">
  <rect x="0" y="0" width="${canvasSize.width}" height="${canvasSize.height}" fill="${canvasColor}" />
  ${markers}
  ${objects}
</svg>`;
}

export function downloadSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
