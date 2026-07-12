import { useEditorStore } from '../store/useEditorStore';

export function PropertiesPanel() {
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const objects = useEditorStore(
    (s) => s.slides.find((slide) => slide.id === activeSlideId)?.objects ?? []
  );
  const updateObject = useEditorStore((s) => s.updateObject);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const setCanvasColor = useEditorStore((s) => s.setCanvasColor);
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const canvasColor = useEditorStore((s) => s.canvasColor);

  const selected = objects.find((o) => o.id === selectedIds[0]);

  return (
    <div className="properties-panel">
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
    </div>
  );
}
