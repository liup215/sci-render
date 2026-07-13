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

      const shapes = Array.from(
        svgEl.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon')
      );
      if (shapes.length === 0) {
        throw new Error('No path or basic shape elements found in SVG');
      }

      const data = shapes
        .map((el) => convertShapeToPathData(el))
        .filter((d): d is string => !!d)
        .join(' ');
      if (!data.trim()) {
        throw new Error('Could not convert SVG elements to path data');
      }

      const { fill, stroke, strokeWidth } = resolveShapeStyle(shapes);

      return {
        data,
        width,
        height,
        fill,
        stroke,
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

function getEffectiveAttribute(el: Element, attr: string): string | null {
  let node: Element | null = el;
  while (node && node.tagName.toLowerCase() !== 'svg') {
    const value = node.getAttribute(attr);
    if (value !== null) return value;
    node = node.parentElement;
  }
  return null;
}

function resolveShapeStyle(shapes: Element[]) {
  let rawFill: string | null = null;
  let rawStroke: string | null = null;
  let strokeWidth = 0;

  for (const el of shapes) {
    if (rawFill === null) {
      rawFill = getEffectiveAttribute(el, 'fill');
    }
    if (rawStroke === null) {
      rawStroke = getEffectiveAttribute(el, 'stroke');
    }
    if (strokeWidth === 0) {
      const sw = getEffectiveAttribute(el, 'stroke-width');
      if (sw) strokeWidth = parseFloat(sw);
    }
    if (rawFill && rawStroke && strokeWidth > 0) break;
  }

  return {
    fill: rawFill === 'none' ? 'transparent' : (rawFill || '#94a3b8'),
    stroke: rawStroke === 'none' ? 'transparent' : (rawStroke || 'none'),
    strokeWidth,
  };
}

function convertShapeToPathData(el: Element): string | null {
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'path': {
      return el.getAttribute('d') || null;
    }

    case 'rect': {
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const w = parseFloat(el.getAttribute('width') || '0');
      const h = parseFloat(el.getAttribute('height') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || rx.toString());
      if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h)) return null;
      if (rx <= 0 || ry <= 0) {
        return `M${x},${y} h${w} v${h} h-${w} Z`;
      }
      return (
        `M${x + rx},${y} h${w - 2 * rx} ` +
        `a${rx},${ry} 0 0 1 ${rx},${ry} v${h - 2 * ry} ` +
        `a${rx},${ry} 0 0 1 -${rx},${ry} h-${w - 2 * rx} ` +
        `a${rx},${ry} 0 0 1 -${rx},-${ry} v-${h - 2 * ry} ` +
        `a${rx},${ry} 0 0 1 ${rx},-${ry} Z`
      );
    }

    case 'circle': {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      if (!r || !Number.isFinite(r)) return null;
      return `M${cx - r},${cy} a${r},${r} 0 1 0 ${2 * r},0 a${r},${r} 0 1 0 -${2 * r},0`;
    }

    case 'ellipse': {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      if (!rx || !ry || !Number.isFinite(rx) || !Number.isFinite(ry)) return null;
      return `M${cx - rx},${cy} a${rx},${ry} 0 1 0 ${2 * rx},0 a${rx},${ry} 0 1 0 -${2 * rx},0`;
    }

    case 'line': {
      const x1 = parseFloat(el.getAttribute('x1') || '0');
      const y1 = parseFloat(el.getAttribute('y1') || '0');
      const x2 = parseFloat(el.getAttribute('x2') || '0');
      const y2 = parseFloat(el.getAttribute('y2') || '0');
      return `M${x1},${y1} L${x2},${y2}`;
    }

    case 'polyline':
    case 'polygon': {
      const points = el.getAttribute('points');
      if (!points) return null;
      const nums = points.trim().split(/[\s,]+/).map(parseFloat);
      if (nums.length < 4 || nums.some(Number.isNaN)) return null;
      const pairs: string[] = [];
      for (let i = 0; i < nums.length; i += 2) {
        pairs.push(`${nums[i]},${nums[i + 1]}`);
      }
      return `M${pairs.join(' L')}${tag === 'polygon' ? ' Z' : ''}`;
    }

    default:
      return null;
  }
}
