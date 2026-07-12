import { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import type { Tool } from '../types';
import type { AlignMode } from '../utils/snap';

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'select', label: 'Select (V)' },
  { id: 'rect', label: 'Rectangle (R)' },
  { id: 'circle', label: 'Circle (C)' },
  { id: 'line', label: 'Line (L)' },
  { id: 'arrow', label: 'Arrow (A)' },
  { id: 'text', label: 'Text (T)' },
];

export function Toolbar() {
  const {
    tool,
    setTool,
    zoom,
    setZoom,
    gridVisible,
    toggleGrid,
    snapEnabled,
    toggleSnap,
    selectedIds,
    alignSelected,
    deleteObjects,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // Deferred to a parent/editor component that holds stage ref.
    // We dispatch a custom event so App can call stage.toDataURL().
    window.dispatchEvent(new CustomEvent('sci-render:export'));
  };

  const handleAlign = (align: AlignMode) => {
    alignSelected(align);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={tool === t.id ? 'active' : ''}
            onClick={() => setTool(t.id)}
            title={t.label}
          >
            {t.label.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="toolbar-group">
        <button onClick={toggleGrid} className={gridVisible ? 'active' : ''}>
          Grid
        </button>
        <button onClick={toggleSnap} className={snapEnabled ? 'active' : ''}>
          Snap
        </button>
      </div>

      <div className="toolbar-group">
        <span>Align:</span>
        {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as AlignMode[]).map((a) => (
          <button
            key={a}
            onClick={() => handleAlign(a)}
            disabled={selectedIds.length < 2}
            title={`Align ${a}`}
          >
            {a[0].toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      <div className="toolbar-group">
        <button onClick={() => setZoom(zoom / 1.1)}>-</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom * 1.1)}>+</button>
        <button onClick={() => setZoom(1)}>Reset</button>
      </div>

      <div className="toolbar-group">
        <button onClick={handleExport}>Export PNG</button>
        <button onClick={() => deleteObjects()} disabled={selectedIds.length === 0}>
          Delete
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          // Future: upload image to canvas
          e.target.value = '';
        }}
      />
    </div>
  );
}
