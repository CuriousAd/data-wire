import { getScheme } from '../../utils/colorSchemes';

export function TableViz({ vizConfig }) {
  const data = vizConfig.data || [];
  const scheme = getScheme(vizConfig.color_scheme);

  if (!data.length) return <p className="text-slate-500 text-sm">No table data available.</p>;

  return (
    <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(10,15,26,0.5)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Label</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Value</th>
            {data.some(d => d.value2 != null) && (
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Value 2</th>
            )}
            {data.some(d => d.group) && (
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Group</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`border-b border-slate-800/50 transition-colors hover:bg-white/[0.02] ${row.highlighted ? 'bg-amber-500/5' : ''}`}
            >
              <td className="px-4 py-2.5 flex items-center gap-2">
                {row.highlighted && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                )}
                <span className={row.highlighted ? 'text-amber-300' : 'text-slate-300'}>{row.label}</span>
              </td>
              <td className="px-4 py-2.5 text-right font-mono font-medium" style={{ color: scheme.primary }}>
                {typeof row.value === 'number' ? row.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : row.value}
              </td>
              {data.some(d => d.value2 != null) && (
                <td className="px-4 py-2.5 text-right font-mono text-slate-400">
                  {row.value2 != null ? row.value2.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                </td>
              )}
              {data.some(d => d.group) && (
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{row.group || '—'}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
