export function ChartTooltip({ active, payload, label, isDark = false }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={`${isDark ? 'glass-strong' : 'bg-white border border-[#e5e0da]'} rounded-xl px-3 py-2 shadow-xl text-xs`}>
      {label && <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1 font-medium`}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#22d3ee' }} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: entry.color || '#22d3ee' }}
          />
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{entry.name}:</span>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export { ChartTooltip as CustomTooltip };
