import { useEditorStore } from '../store/useEditorStore';
import type { ToolCategory } from './Toolbox';
import type { Tool } from '../types';
import { IconLibraryContent } from './IconLibraryContent';

interface ToolDef {
  id: Tool;
  label: string;
  icon: string;
  shortcut?: string;
}

const PALETTE: Record<Exclude<ToolCategory, 'library'>, { title: string; tools: ToolDef[] }> = {
  select: {
    title: 'Select',
    tools: [{ id: 'select', label: 'Select', icon: '↖', shortcut: 'V' }],
  },
  shapes: {
    title: 'Shapes',
    tools: [
      { id: 'rect', label: 'Rectangle', icon: '▭', shortcut: 'R' },
      { id: 'circle', label: 'Circle', icon: '○', shortcut: 'C' },
    ],
  },
  lines: {
    title: 'Lines',
    tools: [
      { id: 'line', label: 'Line', icon: '/', shortcut: 'L' },
      { id: 'arrow', label: 'Arrow', icon: '→', shortcut: 'A' },
    ],
  },
  text: {
    title: 'Text',
    tools: [{ id: 'text', label: 'Text', icon: 'T', shortcut: 'T' }],
  },
  draw: {
    title: 'Draw',
    tools: [{ id: 'pen', label: 'Pen', icon: '✎', shortcut: 'P' }],
  },
};

export interface ToolPaletteProps {
  category: ToolCategory;
}

export function ToolPalette({ category }: ToolPaletteProps) {
  const { tool, setTool } = useEditorStore();

  if (category === 'library') {
    return <IconLibraryContent />;
  }

  const { title, tools } = PALETTE[category];

  return (
    <div className="tool-palette">
      <div className="tool-palette-header">{title}</div>
      <div className="tool-palette-grid">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`tool-palette-item ${tool === t.id ? 'active' : ''}`}
            onClick={() => setTool(t.id)}
            title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
          >
            <span className="tool-palette-item-icon">{t.icon}</span>
            <span className="tool-palette-item-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
