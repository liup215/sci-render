import { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import type { CanvasObject } from '../types';

type Tab = 'properties' | 'layers';

function getObjectLabel(obj: CanvasObject) {
  switch (obj.type) {
    case 'rect':
      return 'Rectangle';
    case 'circle':
      return 'Circle';
    case 'text':
      return `Text: ${obj.text.slice(0, 16)}${obj.text.length > 16 ? '…' : ''}`;
    case 'line':
      return 'Line';
    case 'arrow':
      return 'Arrow';
    case 'image':
      return 'Image';
    case 'group':
      return `Group (${obj.children.length})`;
    case 'path':
      return 'Path';
    default:
      return 'Object';
  }
}

export function PropertiesPanel() {
  const [tab, setTab] = useState<Tab>('properties');

  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const objects = useEditorStore(
    (s) => s.slides.find((slide) => slide.id === activeSlideId)?.objects ?? []
  );
  const updateObject = useEditorStore((s) => s.updateObject);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const setCanvasColor = useEditorStore((s) => s.setCanvasColor);
  const resetSession = useEditorStore((s) => s.resetSession);
  const setSelectedIds = useEditorStore((s) => s.setSelectedIds);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const moveForward = useEditorStore((s) => s.moveForward);
  const moveBackward = useEditorStore((s) => s.moveBackward);
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const canvasColor = useEditorStore((s) => s.canvasColor);

  const selected = objects.find((o) => o.id === selectedIds[0]);
  const hasSelection = selectedIds.length > 0;

  const reversedObjects = [...objects].reverse();

  return (
    <div className="properties-panel">
      <div className="panel-tabs">
        <button
          className={tab === 'properties' ? 'active' : ''}
          onClick={() => setTab('properties')}
        >
          Properties
        </button>
        <button
          className={tab === 'layers' ? 'active' : ''}
          onClick={() => setTab('layers')}
        >
          Layers
        </button>
      </div>

      {tab === 'properties' && (
        <>
          <h3>Canvas</h3>
          <label>
            Width
            <input
              type="number"
              value={canvasSize.width}
              onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
            />
          </label>
          <label>
            Height
            <input
              type="number"
              value={canvasSize.height}
              onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
            />
          </label>
          <label>
            Background
            <input
              type="color"
              value={canvasColor}
              onChange={(e) => setCanvasColor(e.target.value)}
            />
          </label>
          <button
            className="reset-button"
            onClick={() => {
              if (confirm('Reset session? This clears all slides and objects.')) {
                resetSession();
              }
            }}
          >
            Reset session
          </button>

          {selected && (
            <>
              <h3>Object</h3>
              <p>Type: {selected.type}</p>
              {selected.type !== 'line' && (
                <label>
                  Fill
                  <input
                    type="color"
                    value={(selected as { fill?: string }).fill ?? '#000000'}
                    onChange={(e) => updateObject(selected.id, { fill: e.target.value })}
                  />
                </label>
              )}
              <label>
                Stroke
                <input
                  type="color"
                  value={(selected as { stroke?: string }).stroke ?? '#000000'}
                  onChange={(e) => updateObject(selected.id, { stroke: e.target.value })}
                />
              </label>
              <label>
                Stroke Width
                <input
                  type="number"
                  min={0}
                  value={(selected as { strokeWidth?: number }).strokeWidth ?? 0}
                  onChange={(e) =>
                    updateObject(selected.id, { strokeWidth: Number(e.target.value) })
                  }
                />
              </label>
              {selected.type === 'text' && (
                <>
                  <label>
                    Text
                    <input
                      type="text"
                      value={selected.text}
                      onChange={(e) => updateObject(selected.id, { text: e.target.value })}
                    />
                  </label>
                  <label>
                    Font Size
                    <input
                      type="number"
                      min={8}
                      value={selected.fontSize}
                      onChange={(e) =>
                        updateObject(selected.id, { fontSize: Number(e.target.value) })
                      }
                    />
                  </label>
                </>
              )}
            </>
          )}
        </>
      )}

      {tab === 'layers' && (
        <>
          <h3>Layers</h3>
          <div className="layer-actions">
            <button onClick={bringToFront} disabled={!hasSelection} title="Bring to front">
              Top
            </button>
            <button onClick={moveForward} disabled={!hasSelection} title="Move forward">
              Up
            </button>
            <button onClick={moveBackward} disabled={!hasSelection} title="Move backward">
              Down
            </button>
            <button onClick={sendToBack} disabled={!hasSelection} title="Send to back">
              Bottom
            </button>
          </div>
          <div className="layer-list">
            {reversedObjects.map((obj, idx) => {
              const isSelected = selectedIds.includes(obj.id);
              return (
                <div
                  key={obj.id}
                  className={`layer-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedIds([obj.id])}
                >
                  <span className="layer-index">{objects.length - idx}</span>
                  <span className="layer-name">{getObjectLabel(obj)}</span>
                </div>
              );
            })}
            {objects.length === 0 && (
              <div className="layer-empty">No objects on this slide</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
