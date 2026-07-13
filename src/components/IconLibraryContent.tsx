import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ICON_CATEGORIES,
  getCategoryByName,
  loadIconCategory,
  loadAllIconPresets,
  type IconPreset,
} from '../data/iconPresets';
import { v4 as uuidv4 } from 'uuid';
import type { PathObject } from '../types';
import { useEditorStore } from '../store/useEditorStore';
import { IconImporter } from './IconImporter';

type ViewState =
  | { mode: 'categories' }
  | { mode: 'subcategories'; category: string }
  | { mode: 'icons'; category: string; subcategory: string };

export function IconLibraryContent() {
  const [view, setView] = useState<ViewState>({ mode: 'categories' });
  const [query, setQuery] = useState('');
  const [categoryPresets, setCategoryPresets] = useState<IconPreset[]>([]);
  const [searchPresets, setSearchPresets] = useState<IconPreset[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const addObject = useEditorStore((s) => s.addObject);
  const canvasSize = useEditorStore((s) => s.canvasSize);

  const handleInsert = useCallback(
    (preset: IconPreset) => {
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
    },
    [addObject, canvasSize.height, canvasSize.width]
  );

  useEffect(() => {
    if (view.mode !== 'icons') {
      setCategoryPresets([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadIconCategory(view.category)
      .then((presets) => {
        if (!cancelled) setCategoryPresets(presets);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view]);

  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (term === '') {
      setSearchPresets(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadAllIconPresets()
      .then((presets) => {
        if (cancelled) return;
        setSearchPresets(
          presets.filter(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.category.toLowerCase().includes(term) ||
              p.subcategory.toLowerCase().includes(term)
          )
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const subcategories = useMemo(() => {
    if (view.mode !== 'subcategories' && view.mode !== 'icons') return [];
    return getCategoryByName(view.category)?.subcategories ?? [];
  }, [view]);

  const currentIcons = useMemo(() => {
    if (searchPresets) return searchPresets;
    if (view.mode === 'icons') {
      return categoryPresets.filter((p) => p.subcategory === view.subcategory);
    }
    return [];
  }, [searchPresets, categoryPresets, view]);

  const handleCategoryClick = (category: string) => {
    setQuery('');
    setSearchPresets(null);
    setView({ mode: 'subcategories', category });
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setView({ mode: 'icons', category: (view as { category: string }).category, subcategory });
  };

  const goBack = () => {
    if (view.mode === 'icons') {
      setView({ mode: 'subcategories', category: view.category });
    } else if (view.mode === 'subcategories') {
      setView({ mode: 'categories' });
    }
  };

  const categoryColor = (name: string) => getCategoryByName(name)?.color ?? '#3b82f6';

  return (
    <div className="icon-library-content">
      <div className="icon-library-search">
        <input
          type="text"
          placeholder="Search icons..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              setView({ mode: 'categories' });
            }
          }}
        />
        <button
          className="icon-library-import"
          onClick={() => setShowImporter(true)}
          title="Import SVG"
        >
          + SVG
        </button>
      </div>

      {showImporter && <IconImporter onClose={() => setShowImporter(false)} />}

      {view.mode !== 'categories' && searchPresets === null && (
        <div className="icon-library-breadcrumb">
          <button className="icon-library-back" onClick={goBack}>
            ← Back
          </button>
          <span className="icon-library-current">
            {view.mode === 'subcategories' ? view.category : view.subcategory}
          </span>
        </div>
      )}

      <div className="icon-library-scroll">
        {loading && <div className="icon-library-loading">Loading icons…</div>}

        {searchPresets && (
          <div className="icon-library-grid">
            {searchPresets.map((preset) => (
              <IconItem key={preset.id} preset={preset} onInsert={handleInsert} />
            ))}
            {searchPresets.length === 0 && (
              <div className="icon-library-empty">No icons found</div>
            )}
          </div>
        )}

        {searchPresets === null && view.mode === 'categories' && (
          <div className="icon-library-categories-grid">
            {ICON_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className="icon-library-category-card"
                onClick={() => handleCategoryClick(cat.name)}
                title={cat.name}
              >
                <span
                  className="icon-library-category-icon"
                  style={{ background: cat.color }}
                >
                  {cat.name.charAt(0)}
                </span>
                <span className="icon-library-category-name">{cat.name}</span>
                <span className="icon-library-category-count">—</span>
              </button>
            ))}
          </div>
        )}

        {searchPresets === null && view.mode === 'subcategories' && (
          <div className="icon-library-subcategories">
            {subcategories.map((sub) => (
              <button
                key={sub}
                className="icon-library-subcategory"
                onClick={() => handleSubcategoryClick(sub)}
              >
                <span
                  className="icon-library-subcategory-dot"
                  style={{ background: categoryColor(view.category) }}
                />
                <span className="icon-library-subcategory-name">{sub}</span>
                <span className="icon-library-subcategory-arrow">›</span>
              </button>
            ))}
          </div>
        )}

        {searchPresets === null && view.mode === 'icons' && (
          <div className="icon-library-grid">
            {currentIcons.map((preset) => (
              <IconItem key={preset.id} preset={preset} onInsert={handleInsert} />
            ))}
            {!loading && currentIcons.length === 0 && (
              <div className="icon-library-empty">No icons in this subcategory</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IconItem({
  preset,
  onInsert,
}: {
  preset: IconPreset;
  onInsert: (preset: IconPreset) => void;
}) {
  return (
    <button
      className="icon-library-item"
      onClick={() => onInsert(preset)}
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
  );
}
