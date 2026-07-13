export interface IconPreset {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  data: string;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface IconCategory {
  name: string;
  color: string;
  subcategories: string[];
}

// BioRender-inspired scientific icon taxonomy.
// Icons are stored as one JSON file per category under ./icons/.
export const ICON_CATEGORIES: IconCategory[] = [
  {
    name: 'Cell Types',
    color: '#60a5fa',
    subcategories: [
      'Epithelial Cells',
      'Generic Cells',
      'Immune and Blood Cells',
      'Mitosis and Meiosis',
      'Muscle Cells',
      'Neural Cells',
      'Plant Cells',
      'Reproductive Cells',
      'Secretory Cells',
      'Stromal Cells',
    ],
  },
  {
    name: 'Proteins',
    color: '#a78bfa',
    subcategories: [
      'Antibodies',
      'Enzymes',
      'Generic Proteins',
      'Intercellular Proteins',
      'Pathway Proteins',
      'Receptors and Ligands',
      'Soluble Proteins',
      'Transporters',
    ],
  },
  {
    name: 'Nucleic Acids',
    color: '#f472b6',
    subcategories: ['DNA', 'RNA', 'Nucleosomes', 'Plasmids'],
  },
  {
    name: 'Human Anatomy',
    color: '#f87171',
    subcategories: ['Brain', 'Heart', 'Lungs', 'Liver', 'Kidney'],
  },
  {
    name: 'Lab and Objects',
    color: '#94a3b8',
    subcategories: ['Glassware', 'Tools', 'Containers', 'Instruments'],
  },
  {
    name: 'Species',
    color: '#34d399',
    subcategories: ['Mammals', 'Bacteria', 'Viruses', 'Plants'],
  },
  {
    name: 'Agriculture',
    color: '#84cc16',
    subcategories: ['Plants', 'Seeds', 'Trees', 'Crops'],
  },
  {
    name: 'Membranes',
    color: '#22d3ee',
    subcategories: ['Lipid Bilayers', 'Receptors', 'Vesicles', 'Channels'],
  },
  {
    name: 'Cell Structures',
    color: '#38bdf8',
    subcategories: ['Nucleus', 'Mitochondria', 'Golgi', 'ER', 'Ribosomes'],
  },
  {
    name: 'Epithelium',
    color: '#fb923c',
    subcategories: ['Simple', 'Stratified', 'Glandular', 'Specialized'],
  },
  {
    name: 'Lipids and Carbs',
    color: '#fbbf24',
    subcategories: ['Lipids', 'Carbohydrates', 'Glycans'],
  },
  {
    name: 'Chemistry',
    color: '#c084fc',
    subcategories: ['Rings', 'Reactions', 'Atoms', 'Bonds'],
  },
  {
    name: 'Graphs and Symbols',
    color: '#64748b',
    subcategories: ['Arrows', 'Brackets', 'Markers', 'Charts'],
  },
  {
    name: 'Arrows and Shapes',
    color: '#475569',
    subcategories: ['Arrows', 'Basic Shapes', 'Connectors'],
  },
  {
    name: 'Biomoji',
    color: '#facc15',
    subcategories: ['Faces', 'Cells', 'Expressions'],
  },
];

export const ICON_CATEGORY_NAMES = ICON_CATEGORIES.map((c) => c.name);

const categoryFileMap: Record<string, string> = {
  'Cell Types': 'cell-types',
  Proteins: 'proteins',
  'Nucleic Acids': 'nucleic-acids',
  'Human Anatomy': 'human-anatomy',
  'Lab and Objects': 'lab-and-objects',
  Species: 'species',
  Agriculture: 'agriculture',
  Membranes: 'membranes',
  'Cell Structures': 'cell-structures',
  Epithelium: 'epithelium',
  'Lipids and Carbs': 'lipids-and-carbs',
  Chemistry: 'chemistry',
  'Graphs and Symbols': 'graphs-and-symbols',
  'Arrows and Shapes': 'arrows-and-shapes',
  Biomoji: 'biomoji',
};

/**
 * Lazily load all icon presets for a category.
 * Vite supports dynamic imports of JSON in the same directory.
 */
export async function loadIconCategory(categoryName: string): Promise<IconPreset[]> {
  const file = categoryFileMap[categoryName];
  if (!file) {
    console.warn(`Unknown icon category: ${categoryName}`);
    return [];
  }
  const module = await import(`./icons/${file}.json`);
  return module.default as IconPreset[];
}

/**
 * Load every category. Useful for search.
 */
export async function loadAllIconPresets(): Promise<IconPreset[]> {
  const results = await Promise.all(ICON_CATEGORY_NAMES.map(loadIconCategory));
  return results.flat();
}

export function getCategoryByName(name: string): IconCategory | undefined {
  return ICON_CATEGORIES.find((c) => c.name === name);
}

export function getSubcategories(categoryName: string): string[] {
  return getCategoryByName(categoryName)?.subcategories ?? [];
}

export function getCategoryFileName(categoryName: string): string {
  return categoryFileMap[categoryName] ?? categoryName.toLowerCase().replace(/\s+/g, '-');
}
