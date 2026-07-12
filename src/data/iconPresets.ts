export interface IconPreset {
  id: string;
  name: string;
  category: string;
  data: string;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

function createRegularPolygonPath(sides: number, radius: number, cx: number, cy: number) {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  points.push('Z');
  return points.join(' ');
}

function createStarPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points: number
) {
  const path: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    path.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  path.push('Z');
  return path.join(' ');
}

export const ICON_CATEGORIES = ['基础形状', '常用图标'];

export const iconPresets: IconPreset[] = [
  {
    id: 'triangle',
    name: 'Triangle',
    category: '基础形状',
    data: 'M 50 10 L 90 90 L 10 90 Z',
    width: 100,
    height: 100,
    fill: '#60a5fa',
    stroke: '#2563eb',
    strokeWidth: 2,
  },
  {
    id: 'star',
    name: 'Star',
    category: '基础形状',
    data: createStarPath(50, 50, 45, 20, 5),
    width: 100,
    height: 100,
    fill: '#fbbf24',
    stroke: '#d97706',
    strokeWidth: 2,
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    category: '基础形状',
    data: createRegularPolygonPath(5, 45, 50, 50),
    width: 100,
    height: 100,
    fill: '#a78bfa',
    stroke: '#7c3aed',
    strokeWidth: 2,
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    category: '基础形状',
    data: createRegularPolygonPath(6, 45, 50, 50),
    width: 100,
    height: 100,
    fill: '#34d399',
    stroke: '#059669',
    strokeWidth: 2,
  },
  {
    id: 'heart',
    name: 'Heart',
    category: '常用图标',
    data: 'M 50 30 C 20 0, 0 30, 50 90 C 100 30, 80 0, 50 30 Z',
    width: 100,
    height: 100,
    fill: '#f87171',
    stroke: '#dc2626',
    strokeWidth: 2,
  },
  {
    id: 'cloud',
    name: 'Cloud',
    category: '常用图标',
    data:
      'M 25 65 C 5 65 5 35 25 35 C 25 10 70 10 80 30 C 100 20 110 45 100 65 Z',
    width: 110,
    height: 75,
    fill: '#93c5fd',
    stroke: '#3b82f6',
    strokeWidth: 2,
  },
  {
    id: 'check',
    name: 'Check',
    category: '常用图标',
    data: 'M 10 55 L 35 80 L 90 20',
    width: 100,
    height: 100,
    fill: 'transparent',
    stroke: '#16a34a',
    strokeWidth: 8,
  },
  {
    id: 'lightning',
    name: 'Lightning',
    category: '常用图标',
    data: 'M 55 5 L 25 55 L 50 55 L 35 95 L 75 40 L 50 40 Z',
    width: 100,
    height: 100,
    fill: '#facc15',
    stroke: '#ca8a04',
    strokeWidth: 2,
  },
];
