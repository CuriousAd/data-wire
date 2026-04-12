export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-strong rounded-xl px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-slate-400 mb-1 font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#22d3ee' }} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: entry.color || '#22d3ee' }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-white">
            {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export { ChartTooltip as CustomTooltip };
