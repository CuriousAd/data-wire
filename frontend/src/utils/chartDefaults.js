export const getChartStyles = (isDark) => ({
  gridStroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  tickColor: isDark ? '#94a3b8' : '#64748b',
  labelColor: isDark ? '#64748b' : '#475569',
  legendColor: isDark ? '#94a3b8' : '#64748b',
});
