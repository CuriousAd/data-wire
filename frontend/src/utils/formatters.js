export const compactNumber = (val) => {
  if (typeof val !== 'number') return val;
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(val);
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function normalizeDataPoint(d) {
  return {
    label:       d.label  ?? d.x ?? d.name ?? '',
    value:       d.value  ?? d.actual ?? d.y ?? null,
    value2:      d.value2 ?? d.secondary ?? null,
    group:       d.group  ?? null,
    highlighted: d.highlighted ?? false,
  };
}

export function safeInterval(len) {
  if (len <= 12) return 0;
  return Math.max(1, Math.floor(len / 8));
}
