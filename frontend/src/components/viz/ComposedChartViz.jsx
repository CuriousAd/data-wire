import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
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

function safeInterval(len) {
  if (len <= 12) return 0;
  return Math.max(1, Math.floor(len / 8));
}

export function ComposedChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data   = (vizConfig.data || []).map(normalise);

  const metricName    = vizConfig.y_label || vizConfig.title || 'Metric';
  const secondaryName = vizConfig.y2_label || 'Secondary Metric';
  const hasValue2     = data.some(d => d.value2 != null);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="composedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={scheme.primary} stopOpacity={0.25} />
            <stop offset="95%" stopColor={scheme.primary} stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          angle={data.length > 8 ? -35 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          interval={safeInterval(data.length)}
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

        {/* Area for primary trend */}
        <Area
          type="monotone"
          dataKey="value"
          name={metricName}
          fill="url(#composedGrad)"
          stroke={scheme.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: scheme.primary, stroke: '#0a0f1a', strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={800}
          connectNulls
        />

        {/* Bar for secondary series if present */}
        {hasValue2 && (
          <Bar
            dataKey="value2"
            name={secondaryName}
            fill={scheme.secondary}
            opacity={0.7}
            radius={[3, 3, 0, 0]}
            isAnimationActive={true}
            animationDuration={600}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
