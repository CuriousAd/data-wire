import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber, normalizeDataPoint, safeInterval } from '../../utils/formatters';
import { getChartStyles } from '../../utils/chartDefaults';

export function AreaChartViz({ vizConfig, isDark = false }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data   = (vizConfig.data || []).map(normalizeDataPoint);

  const metricName    = vizConfig.y_label || vizConfig.title || 'Metric';
  const secondaryName = vizConfig.y2_label || 'Secondary Metric';
  const hasValue2     = data.some(d => d.value2 != null);

  const styles = getChartStyles(isDark);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={scheme.primary}   stopOpacity={0.35} />
            <stop offset="95%" stopColor={scheme.primary}   stopOpacity={0}    />
          </linearGradient>
          {hasValue2 && (
            <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={scheme.secondary} stopOpacity={0.35} />
              <stop offset="95%" stopColor={scheme.secondary} stopOpacity={0}    />
            </linearGradient>
          )}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke={styles.gridStroke} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: styles.tickColor, fontSize: 11 }}
          angle={data.length > 8 ? -35 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          interval={safeInterval(data.length)}
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

        <Area
          type="monotone"
          dataKey="value"
          name={metricName}
          stroke={scheme.primary}
          fill="url(#areaGrad1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: scheme.primary, stroke: isDark ? '#0a0f1a' : '#ffffff', strokeWidth: 2 }}
          stackId={vizConfig.stacked ? '1' : undefined}
          isAnimationActive={true}
          animationDuration={800}
          connectNulls
        />

        {hasValue2 && (
          <Area
            type="monotone"
            dataKey="value2"
            name={secondaryName}
            stroke={scheme.secondary}
            fill="url(#areaGrad2)"
            strokeWidth={2}
            dot={false}
            stackId={vizConfig.stacked ? '1' : undefined}
            connectNulls
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
