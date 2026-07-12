import { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';

export function SlidePanel() {
  const { slides, activeSlideId, addSlide, setActiveSlide, deleteSlide, renameSlide } =
    useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="slide-panel">
      <div className="slide-panel-header">
        <span>Slides</span>
        <button onClick={addSlide}>+ Add</button>
      </div>
      <div className="slide-list">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide-item ${slide.id === activeSlideId ? 'active' : ''}`}
            onClick={() => setActiveSlide(slide.id)}
          >
            <span className="slide-number">{index + 1}</span>
            {editingId === slide.id ? (
              <input
                autoFocus
                defaultValue={slide.name}
                onBlur={(e) => {
                  renameSlide(slide.id, e.target.value || slide.name);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameSlide(slide.id, e.currentTarget.value || slide.name);
                    setEditingId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="slide-name"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(slide.id);
                }}
              >
                {slide.name}
              </span>
            )}
            {slides.length > 1 && (
              <button
                className="slide-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSlide(slide.id);
                }}
                title="Delete slide"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
