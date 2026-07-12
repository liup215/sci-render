import { useState } from 'react';
import { iconPresets, ICON_CATEGORIES } from '../data/iconPresets';
import { v4 as uuidv4 } from 'uuid';
import type { PathObject } from '../types';
import { useEditorStore } from '../store/useEditorStore';

export function IconLibraryContent() {
  const [activeCategory, setActiveCategory] = useState<string>(ICON_CATEGORIES[0]);
  const addObject = useEditorStore((s) => s.addObject);
  const canvasSize = useEditorStore((s) => s.canvasSize);

  const handleInsert = (preset: (typeof iconPresets)[number]) => {
    const obj: PathObject = {
      id: uuidv4(),
      type: 'path',
      x: canvasSize.width / 2 - preset.width / 2,
      y: canvasSize.height / 2 - preset.height / 2,
      width: preset.width,
      height: preset.height,
      data: preset.data,
      fill: preset.fill,
      stroke: preset.stroke,
      strokeWidth: preset.strokeWidth,
      rotation: 0,
      draggable: true,
    };
    addObject(obj);
  };

  const filtered = iconPresets.filter((p) => p.category === activeCategory);

  return (
    <div className="icon-library-content">
      <div className="icon-library-categories">
        {ICON_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`icon-library-category ${cat === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="icon-library-grid">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            className="icon-library-item"
            onClick={() => handleInsert(preset)}
            title={preset.name}
          >
            <svg
              viewBox={`0 0 ${preset.width} ${preset.height}`}
              className="icon-library-preview"
            >
              <path
                d={preset.data}
                fill={preset.fill}
                stroke={preset.stroke}
                strokeWidth={preset.strokeWidth}
              />
            </svg>
            <span className="icon-library-name">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
