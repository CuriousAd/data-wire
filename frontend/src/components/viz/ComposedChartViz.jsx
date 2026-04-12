import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber } from '../../utils/formatters';

export function ComposedChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data = vizConfig.data || [];
  
  const metricName = vizConfig.y_label || vizConfig.title || 'Metric';
  const secondaryName = vizConfig.y_label ? `Secondary ${vizConfig.y_label}` : 'Secondary Metric';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="composedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={scheme.primary} stopOpacity={0.25} />
            <stop offset="95%" stopColor={scheme.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={Math.floor(data.length / 8)}
          label={vizConfig.x_label ? { value: vizConfig.x_label, position: 'insideBottom', offset: -30, fill: '#64748b', fontSize: 11 } : undefined}
        />
        <YAxis
          tickFormatter={compactNumber}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          label={vizConfig.y_label ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        {vizConfig.show_legend && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}
        <Area
          type="monotone"
          dataKey="value"
          name={metricName}
          fill="url(#composedGrad)"
          stroke={scheme.primary}
          strokeWidth={2}
          dot={false}
        />
        {data.some(d => d.value2 != null) && (
          <Bar dataKey="value2" name={secondaryName} fill={scheme.secondary} opacity={0.7} radius={[3, 3, 0, 0]} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
