export type ToolCategory = 'select' | 'shapes' | 'lines' | 'text' | 'draw' | 'library';

export interface CategoryDef {
  id: ToolCategory;
  label: string;
  icon: string;
  shortcut?: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'select', label: 'Select', icon: '↖', shortcut: 'V' },
  { id: 'shapes', label: 'Shapes', icon: '▧', shortcut: 'R' },
  { id: 'lines', label: 'Lines', icon: '/', shortcut: 'L' },
  { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
  { id: 'draw', label: 'Draw', icon: '✎', shortcut: 'P' },
  { id: 'library', label: 'Library', icon: '☷' },
];

export interface ToolboxProps {
  activeCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
}

export function Toolbox({ activeCategory, onSelectCategory }: ToolboxProps) {
  return (
    <div className="toolbox">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`toolbox-category ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
          title={`${cat.label}${cat.shortcut ? ` (${cat.shortcut})` : ''}`}
        >
          <span className="toolbox-category-icon">{cat.icon}</span>
          <span className="toolbox-category-label">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
