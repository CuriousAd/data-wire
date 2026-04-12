// Color schemes matching backend viz_schema.py color_scheme enum

export const COLOR_SCHEMES = {
  default: {
    primary: '#22d3ee',
    secondary: '#a78bfa',
    colors: ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa', '#fbbf24'],
    gradient: ['#06b6d4', '#8b5cf6'],
  },
  financial: {
    primary: '#22c55e',
    secondary: '#ef4444',
    colors: ['#22c55e', '#ef4444', '#84cc16', '#f97316', '#10b981', '#dc2626', '#65a30d'],
    gradient: ['#22c55e', '#ef4444'],
  },
  risk: {
    primary: '#f59e0b',
    secondary: '#ef4444',
    colors: ['#f59e0b', '#ef4444', '#fb923c', '#dc2626', '#fcd34d', '#b45309', '#fbbf24'],
    gradient: ['#f59e0b', '#ef4444'],
  },
  geo: {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    colors: ['#3b82f6', '#06b6d4', '#6366f1', '#0ea5e9', '#8b5cf6', '#2563eb', '#38bdf8'],
    gradient: ['#3b82f6', '#06b6d4'],
  },
};

export function getScheme(colorScheme = 'default') {
  return COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.default;
}

// Map value -> color using a linear scale (for choropleth maps)
export function getMapColorScale(scheme = 'geo') {
  const s = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.geo;
  return s.colors;
}
