import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber } from '../../utils/formatters';
import { getChartStyles } from '../../utils/chartDefaults';

export function ScatterChartViz({ vizConfig, isDark = false }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const raw = vizConfig.data || [];
  
  const metricName = vizConfig.y_label || vizConfig.title || 'Data Point';

  // Transform to { x, y, highlighted }
  const points = raw.map(d => ({ x: d.value, y: d.value2 ?? 0, label: d.label, highlighted: d.highlighted }));

  const styles = getChartStyles(isDark);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={styles.gridStroke} vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          tickFormatter={compactNumber}
          tick={{ fill: styles.tickColor, fontSize: 11 }}
          label={vizConfig.x_label ? { value: vizConfig.x_label, position: 'insideBottom', offset: -5, fill: styles.labelColor, fontSize: 11 } : undefined}
        />
        <YAxis
          dataKey="y"
          type="number"
          tickFormatter={compactNumber}
          tick={{ fill: styles.tickColor, fontSize: 11 }}
          label={vizConfig.y_label ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: styles.labelColor, fontSize: 11 } : undefined}
        />
        <ZAxis range={[40, 80]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: styles.gridStroke }}
          content={<CustomTooltip isDark={isDark} />}
        />
        <Scatter
          name={metricName}
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
