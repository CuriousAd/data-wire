import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';

export function ScatterChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const raw = vizConfig.data || [];

  // Transform to { x, y, highlighted }
  const points = raw.map(d => ({ x: d.value, y: d.value2 ?? 0, label: d.label, highlighted: d.highlighted }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="x"
          type="number"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          label={vizConfig.x_label ? { value: vizConfig.x_label, position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 } : undefined}
        />
        <YAxis
          dataKey="y"
          type="number"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          label={vizConfig.y_label ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 } : undefined}
        />
        <ZAxis range={[40, 80]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
          content={<CustomTooltip />}
        />
        <Scatter
          data={points}
          fill={scheme.primary}
          fillOpacity={0.7}
          shape={(props) => {
            const { cx, cy, payload } = props;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={payload.highlighted ? 8 : 5}
                fill={payload.highlighted ? scheme.secondary : scheme.primary}
                fillOpacity={0.8}
                stroke={payload.highlighted ? scheme.secondary : scheme.primary}
                strokeWidth={payload.highlighted ? 2 : 1}
                strokeOpacity={0.5}
              />
            );
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
