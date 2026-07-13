import { useMemo, useState } from 'react';
import { ICON_CATEGORIES, getCategoryFileName, type IconPreset } from '../data/iconPresets';

interface IconImporterProps {
  onClose: () => void;
}

export function IconImporter({ onClose }: IconImporterProps) {
  const [svgInput, setSvgInput] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [category, setCategory] = useState(ICON_CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState(ICON_CATEGORIES[0].subcategories[0]);

  const subcategories = useMemo(() => {
    return ICON_CATEGORIES.find((c) => c.name === category)?.subcategories ?? [];
  }, [category]);

  const parsed = useMemo(() => {
    if (!svgInput.trim()) return null;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgInput, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) throw new Error('Invalid SVG markup');

      const svgEl = doc.documentElement;
      const viewBox = svgEl.getAttribute('viewBox');
      let width = parseFloat(svgEl.getAttribute('width') || '0');
      let height = parseFloat(svgEl.getAttribute('height') || '0');

      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(parseFloat);
        if (parts.length === 4) {
          width = parts[2];
          height = parts[3];
        }
      }

      if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height)) {
        throw new Error('Could not determine SVG width/height (need width/height or viewBox)');
      }

      const paths = Array.from(svgEl.querySelectorAll('path'));
      if (paths.length === 0) {
        throw new Error('No <path> elements found in SVG');
      }

      const data = paths.map((p) => p.getAttribute('d') || '').join(' ');
      const first = paths[0];
      const rawFill = first.getAttribute('fill') || '#94a3b8';
      const rawStroke = first.getAttribute('stroke') || 'none';
      const strokeWidthAttr = first.getAttribute('stroke-width');
      const strokeWidth = strokeWidthAttr ? parseFloat(strokeWidthAttr) : 0;

      return {
        data,
        width,
        height,
        fill: rawFill === 'none' ? 'transparent' : rawFill,
        stroke: rawStroke === 'none' ? 'transparent' : rawStroke,
        strokeWidth,
      };
    } catch {
      return null;
    }
  }, [svgInput]);

  const preset: IconPreset | null = useMemo(() => {
    if (!parsed) return null;
    const presetId = toKebabCase(id || name) || 'custom-icon';
    const presetName = name.trim() || 'Custom Icon';
    return {
      id: presetId,
      name: presetName,
      category,
      subcategory,
      data: parsed.data,
      width: parsed.width,
      height: parsed.height,
      fill: parsed.fill,
      stroke: parsed.stroke,
      strokeWidth: parsed.strokeWidth,
    };
  }, [parsed, name, id, category, subcategory]);

  const jsonSnippet = useMemo(() => {
    if (!preset) return '';
    return JSON.stringify(preset, null, 2);
  }, [preset]);

  const fileName = getCategoryFileName(category);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonSnippet);
  };

  return (
    <div className="icon-importer-overlay" onClick={onClose}>
      <div className="icon-importer-modal" onClick={(e) => e.stopPropagation()}>
        <header className="icon-importer-header">
          <h2>Import SVG to Icon Library</h2>
          <button className="icon-importer-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="icon-importer-body">
          <div className="icon-importer-columns">
            <div className="icon-importer-col">
              <label className="icon-importer-label">
                1. Paste SVG markup
                <textarea
                  className="icon-importer-textarea"
                  placeholder='<svg viewBox="0 0 100 100" ...>\n  <path d="..." />\n</svg>'
                  value={svgInput}
                  onChange={(e) => setSvgInput(e.target.value)}
                />
              </label>
            </div>

            <div className="icon-importer-col">
              <label className="icon-importer-label">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!id) setId(toKebabCase(e.target.value));
                  }}
                  placeholder="e.g. E. coli"
                />
              </label>

              <label className="icon-importer-label">
                ID
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(toKebabCase(e.target.value))}
                  placeholder="e.g. e-coli"
                />
              </label>

              <label className="icon-importer-label">
                Category
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    const nextSubs = ICON_CATEGORIES.find((c) => c.name === e.target.value)
                      ?.subcategories ?? ['Other'];
                    setSubcategory(nextSubs[0]);
                  }}
                >
                  {ICON_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="icon-importer-label">
                Subcategory
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  key={category}
                >
                  {subcategories.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="icon-importer-hint">
                Add the generated JSON to:
                <code>src/data/icons/{fileName}.json</code>
              </div>
            </div>

            <div className="icon-importer-col">
              <div className="icon-importer-label">3. Preview</div>
              {parsed ? (
                <svg
                  viewBox={`0 0 ${parsed.width} ${parsed.height}`}
                  className="icon-importer-preview"
                >
                  <path
                    d={parsed.data}
                    fill={parsed.fill}
                    stroke={parsed.stroke}
                    strokeWidth={parsed.strokeWidth}
                  />
                </svg>
              ) : (
                <div className="icon-importer-preview-placeholder">Paste a valid SVG</div>
              )}
            </div>
          </div>

          <div className="icon-importer-output">
            <div className="icon-importer-output-header">
              <span className="icon-importer-label">4. Generated JSON entry</span>
              <button className="icon-importer-copy" onClick={handleCopy} disabled={!preset}>
                Copy
              </button>
            </div>
            <pre className="icon-importer-code">{jsonSnippet || '// Paste a valid SVG first'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}
