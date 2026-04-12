import { getScheme } from '../../utils/colorSchemes';

export function TableViz({ vizConfig, isDark = false }) {
  const data = vizConfig.data || [];
  const scheme = getScheme(vizConfig.color_scheme);

  if (!data.length) return <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-sm`}>No table data available.</p>;

  // Classes based on theme
  const bgClass = isDark ? 'bg-[rgba(10,15,26,0.5)] border-none' : 'bg-white border border-[#e5e0da]';
  const thClass = isDark ? 'border-b border-slate-700/50 text-slate-400' : 'border-b border-slate-200 text-slate-500 bg-slate-50/50';
  const trClass = isDark ? 'border-b border-slate-800/50 hover:bg-white/[0.02]' : 'border-b border-slate-100 hover:bg-slate-50/50';
  const textClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const groupBgClass = isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600';

  return (
    <div className={`overflow-x-auto rounded-xl ${bgClass}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={thClass}>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Label</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Value</th>
            {data.some(d => d.value2 != null) && (
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Value 2</th>
            )}
            {data.some(d => d.group) && (
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Group</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`${trClass} transition-colors ${row.highlighted ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50') : ''}`}
            >
              <td className="px-4 py-2.5 flex items-center gap-2">
                {row.highlighted && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                )}
                <span className={row.highlighted ? (isDark ? 'text-amber-300' : 'text-amber-600') : textClass}>{row.label}</span>
              </td>
              <td className="px-4 py-2.5 text-right font-mono font-medium" style={{ color: scheme.primary }}>
                {typeof row.value === 'number' ? row.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : row.value}
              </td>
              {data.some(d => d.value2 != null) && (
                <td className={`px-4 py-2.5 text-right font-mono ${mutedTextClass}`}>
                  {row.value2 != null ? row.value2.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                </td>
              )}
              {data.some(d => d.group) && (
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${groupBgClass}`}>{row.group || '—'}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
