import { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';

const MINOR_STEP = 20;
const MAJOR_STEP = 100;

interface RulerCanvasProps {
  orientation: 'horizontal' | 'vertical';
}

function RulerCanvas({ orientation }: RulerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { zoom, stagePos } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(size.width * dpr));
    canvas.height = Math.max(1, Math.floor(size.height * dpr));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size.width, size.height);

    const isHorizontal = orientation === 'horizontal';
    const axisSize = isHorizontal ? size.width : size.height;
    const crossSize = isHorizontal ? size.height : size.width;
    const offset = isHorizontal ? stagePos.x : stagePos.y;

    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.strokeStyle = '#9ca3af';
    ctx.fillStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Find visible world range.
    const startWorld = (-offset) / zoom;
    const endWorld = (axisSize - offset) / zoom;

    const firstMinor = Math.floor(startWorld / MINOR_STEP) * MINOR_STEP;
    const lastMinor = Math.ceil(endWorld / MINOR_STEP) * MINOR_STEP;

    for (let w = firstMinor; w <= lastMinor; w += MINOR_STEP) {
      const screen = w * zoom + offset;
      if (screen < -1 || screen > axisSize + 1) continue;

      const isMajor = Math.abs(w % MAJOR_STEP) < 0.001 || Math.abs((w % MAJOR_STEP) - MAJOR_STEP) < 0.001;
      const tickLen = isMajor ? crossSize * 0.7 : crossSize * 0.35;

      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(screen, crossSize);
        ctx.lineTo(screen, crossSize - tickLen);
      } else {
        ctx.moveTo(crossSize, screen);
        ctx.lineTo(crossSize - tickLen, screen);
      }
      ctx.stroke();

      if (isMajor && w !== 0) {
        const label = Math.round(w).toString();
        if (isHorizontal) {
          ctx.fillText(label, screen + 2, 2);
        } else {
          ctx.save();
          ctx.translate(2, screen + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      }
    }

    // Zero line (canvas origin) if visible.
    const zeroScreen = offset;
    if (zeroScreen >= 0 && zeroScreen <= axisSize) {
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(zeroScreen, 0);
        ctx.lineTo(zeroScreen, crossSize);
      } else {
        ctx.moveTo(0, zeroScreen);
        ctx.lineTo(crossSize, zeroScreen);
      }
      ctx.stroke();
    }
  }, [orientation, size, zoom, stagePos]);

  return (
    <div ref={containerRef} className={`ruler ruler-${orientation}`}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export function Rulers() {
  const { rulersVisible } = useEditorStore();
  if (!rulersVisible) return null;
  return (
    <>
      <div className="ruler-corner" />
      <RulerCanvas orientation="horizontal" />
      <RulerCanvas orientation="vertical" />
    </>
  );
}
