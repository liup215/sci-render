import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '../store/useEditorStore';
import type { Tool, CanvasObject } from '../types';
import type { AlignMode } from '../utils/snap';

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'select', label: 'Select (V)' },
  { id: 'rect', label: 'Rectangle (R)' },
  { id: 'circle', label: 'Circle (C)' },
  { id: 'line', label: 'Line (L)' },
  { id: 'arrow', label: 'Arrow (A)' },
  { id: 'text', label: 'Text (T)' },
];

interface ToolbarProps {
  onOpenIconLibrary: () => void;
}

export function Toolbar({ onOpenIconLibrary }: ToolbarProps) {
  const {
    tool,
    setTool,
    zoom,
    setZoom,
    gridVisible,
    toggleGrid,
    rulersVisible,
    toggleRulers,
    snapEnabled,
    toggleSnap,
    selectedIds,
    alignSelected,
    deleteObjects,
    addObject,
    groupSelected,
    ungroupSelected,
    canvasSize,
    undo,
    redo,
    past,
    future,
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

  const handleImageUpload = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = new Image();
    img.onload = () => {
      const maxDim = 200;
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width *= scale;
        height *= scale;
      }
      addObject({
        id: uuidv4(),
        type: 'image',
        src: dataUrl,
        x: (canvasSize.width - width) / 2,
        y: (canvasSize.height - height) / 2,
        width,
        height,
        draggable: true,
      } as CanvasObject);
    };
    img.src = dataUrl;
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
        <button onClick={toggleRulers} className={rulersVisible ? 'active' : ''}>
          Rulers
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
        <span>Group:</span>
        <button onClick={groupSelected} disabled={selectedIds.length < 2}>
          Group
        </button>
        <button onClick={ungroupSelected} disabled={selectedIds.length === 0}>
          Ungroup
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={() => setZoom(zoom / 1.1)}>-</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom * 1.1)}>+</button>
        <button onClick={() => setZoom(1)}>Reset</button>
      </div>

      <div className="toolbar-group">
        <button onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y / Ctrl+Shift+Z)">
          Redo
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={() => fileInputRef.current?.click()}>Image</button>
        <button onClick={onOpenIconLibrary}>Icons</button>
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
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
