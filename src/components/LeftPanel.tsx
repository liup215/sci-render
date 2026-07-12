import { useEffect, useState } from 'react';
import { Toolbox, type ToolCategory } from './Toolbox';
import { ToolPalette } from './ToolPalette';
import { useEditorStore } from '../store/useEditorStore';
import type { Tool } from '../types';

const TOOL_TO_CATEGORY: Partial<Record<Tool, ToolCategory>> = {
  select: 'select',
  rect: 'shapes',
  circle: 'shapes',
  line: 'lines',
  arrow: 'lines',
  text: 'text',
  pen: 'draw',
};

export function LeftPanel() {
  const tool = useEditorStore((s) => s.tool);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('select');

  useEffect(() => {
    const category = TOOL_TO_CATEGORY[tool];
    if (category && category !== activeCategory) {
      setActiveCategory(category);
    }
  }, [tool]);

  return (
    <div className="left-panel">
      <Toolbox activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <div className="left-panel-body">
        <ToolPalette category={activeCategory} />
      </div>
    </div>
  );
}
