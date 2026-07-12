import { useEditorStore } from '../store/useEditorStore';
import type { Tool } from '../types';

const TOOL_LABELS: Record<Tool, string> = {
  select: 'Select (V)',
  rect: 'Rectangle (R)',
  circle: 'Circle (C)',
  line: 'Line (L)',
  arrow: 'Arrow (A)',
  text: 'Text (T)',
  pen: 'Pen (P)',
};

const GROUPS: { label: string; tools: Tool[] }[] = [
  { label: 'Select', tools: ['select'] },
  { label: 'Shapes', tools: ['rect', 'circle'] },
  { label: 'Lines', tools: ['line', 'arrow'] },
  { label: 'Text', tools: ['text'] },
  { label: 'Draw', tools: ['pen'] },
];

export function Toolbox() {
  const { tool, setTool } = useEditorStore();

  return (
    <div className="toolbox">
      {GROUPS.map((group) => (
        <div key={group.label} className="toolbox-group">
          <span className="toolbox-group-label">{group.label}</span>
          {group.tools.map((id) => {
            const label = TOOL_LABELS[id];
            return (
              <button
                key={id}
                className={tool === id ? 'active' : ''}
                onClick={() => setTool(id)}
                title={label}
              >
                {label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
