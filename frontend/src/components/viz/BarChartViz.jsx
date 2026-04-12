import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber, normalizeDataPoint } from '../../utils/formatters';
import { getChartStyles } from '../../utils/chartDefaults';

export function BarChartViz({ vizConfig, isDark = false }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data   = (vizConfig.data || []).map(normalizeDataPoint);

  const metricName    = vizConfig.y_label || vizConfig.title || 'Metric';
  const secondaryName = vizConfig.y2_label || 'Secondary Metric';
  const hasValue2     = data.some(d => d.value2 != null);

  const styles = getChartStyles(isDark);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={styles.gridStroke} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: styles.tickColor, fontSize: 11 }}
          angle={data.length > 8 ? -35 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          interval={0}
          label={vizConfig.x_label
            ? { value: vizConfig.x_label, position: 'insideBottom', offset: -30, fill: styles.labelColor, fontSize: 11 }
            : undefined}
        />
        <YAxis
          tickFormatter={compactNumber}
          tick={{ fill: styles.tickColor, fontSize: 11 }}
          width={48}
          label={vizConfig.y_label
            ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: styles.labelColor, fontSize: 11 }
            : undefined}
        />
        <Tooltip content={<CustomTooltip isDark={isDark} />} />
        {vizConfig.show_legend && <Legend wrapperStyle={{ color: styles.legendColor, fontSize: 12 }} />}

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
