import { useState } from 'react';
import { Toolbox, type ToolCategory } from './Toolbox';
import { ToolPalette } from './ToolPalette';

export function LeftPanel() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('select');

  return (
    <div className="left-panel">
      <Toolbox activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <div className="left-panel-body">
        <ToolPalette category={activeCategory} />
      </div>
    </div>
  );
}
