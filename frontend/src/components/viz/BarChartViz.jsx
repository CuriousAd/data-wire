import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';

export function BarChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data = vizConfig.data || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={0}
          label={vizConfig.x_label ? { value: vizConfig.x_label, position: 'insideBottom', offset: -30, fill: '#64748b', fontSize: 11 } : undefined}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          label={vizConfig.y_label ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        {vizConfig.show_legend && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}
        <Bar dataKey="value" name={vizConfig.y_label || 'Value'} fill={scheme.primary} radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.highlighted ? scheme.secondary : scheme.colors[idx % scheme.colors.length]}
            />
          ))}
        </Bar>
        {data.some(d => d.value2 != null) && (
          <Bar dataKey="value2" name="Value 2" fill={scheme.secondary} radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
