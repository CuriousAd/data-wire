import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber } from '../../utils/formatters';

function normalise(d) {
  return {
    label:       d.label  ?? d.x ?? d.name ?? '',
    value:       d.value  ?? d.actual ?? d.y ?? null,
    value2:      d.value2 ?? d.secondary ?? null,
    highlighted: d.highlighted ?? false,
  };
}

export function BarChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data   = (vizConfig.data || []).map(normalise);

  const metricName    = vizConfig.y_label || vizConfig.title || 'Metric';
  const secondaryName = vizConfig.y2_label || 'Secondary Metric';
  const hasValue2     = data.some(d => d.value2 != null);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          angle={data.length > 8 ? -35 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          interval={0}
          label={vizConfig.x_label
            ? { value: vizConfig.x_label, position: 'insideBottom', offset: -30, fill: '#64748b', fontSize: 11 }
            : undefined}
        />
        <YAxis
          tickFormatter={compactNumber}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          width={48}
          label={vizConfig.y_label
            ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }
            : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        {vizConfig.show_legend && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}

        <Bar
          dataKey="value"
          name={metricName}
          fill={scheme.primary}
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
          animationDuration={600}
        >
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.highlighted ? scheme.secondary : scheme.colors[idx % scheme.colors.length]}
            />
          ))}
        </Bar>

        {hasValue2 && (
          <Bar
            dataKey="value2"
            name={secondaryName}
            fill={scheme.secondary}
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={600}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
