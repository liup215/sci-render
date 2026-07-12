import { useEditorStore } from '../store/useEditorStore';
import type { Tool } from '../types';

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'select', label: 'Select (V)' },
  { id: 'rect', label: 'Rectangle (R)' },
  { id: 'circle', label: 'Circle (C)' },
  { id: 'line', label: 'Line (L)' },
  { id: 'arrow', label: 'Arrow (A)' },
  { id: 'text', label: 'Text (T)' },
  { id: 'pen', label: 'Pen (P)' },
];

export function Toolbox() {
  const { tool, setTool } = useEditorStore();

  return (
    <div className="toolbox">
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
  );
}
