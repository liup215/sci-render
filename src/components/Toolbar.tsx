import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '../store/useEditorStore';
import type { CanvasObject } from '../types';
import type { AlignMode } from '../utils/snap';

export function Toolbar() {
  const {
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
    exportSvg,
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
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
        <button onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y / Ctrl+Shift+Z)">
          Redo
        </button>
        <button onClick={groupSelected} disabled={selectedIds.length < 2} title="Group (Ctrl+G)">
          Group
        </button>
        <button onClick={ungroupSelected} disabled={selectedIds.length === 0} title="Ungroup (Ctrl+Shift+G)">
          Ungroup
        </button>
        <button onClick={() => deleteObjects()} disabled={selectedIds.length === 0} title="Delete">
          Delete
        </button>
      </div>

      <div className="toolbar-group">
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
        <button onClick={bringToFront} disabled={selectedIds.length === 0} title="Bring to front">
          Front
        </button>
        <button onClick={moveForward} disabled={selectedIds.length === 0} title="Move forward">
          Up
        </button>
        <button onClick={moveBackward} disabled={selectedIds.length === 0} title="Move backward">
          Down
        </button>
        <button onClick={sendToBack} disabled={selectedIds.length === 0} title="Send to back">
          Back
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={toggleGrid} className={gridVisible ? 'active' : ''} title="Toggle grid">
          Grid
        </button>
        <button onClick={toggleRulers} className={rulersVisible ? 'active' : ''} title="Toggle rulers">
          Rulers
        </button>
        <button onClick={toggleSnap} className={snapEnabled ? 'active' : ''} title="Toggle snap">
          Snap
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={() => fileInputRef.current?.click()} title="Upload image">
          Image
        </button>
        <button onClick={handleExport}>Export PNG</button>
        <button onClick={exportSvg}>Export SVG</button>
      </div>

      <div className="toolbar-group toolbar-zoom">
        <button onClick={() => setZoom(zoom / 1.1)} title="Zoom out">
          −
        </button>
        <span className="zoom-value">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom * 1.1)} title="Zoom in">
          +
        </button>
        <button onClick={() => setZoom(1)} title="Reset zoom">
          Reset
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
