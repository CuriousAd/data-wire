import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber, normalizeDataPoint, safeInterval } from '../../utils/formatters';
import { getChartStyles } from '../../utils/chartDefaults';

export function LineChartViz({ vizConfig, isDark = false }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const rawHistorical = vizConfig.data || [];
  const forecastData  = vizConfig.forecast || [];

  const metricName = vizConfig.y_label || vizConfig.title || 'Metric';

  // Normalise historical data so both { label, value } and { label, actual } work
  const historicalData = rawHistorical.map(d => {
    const norm = normalizeDataPoint(d);
    return { ...norm, actual: norm.value }; // Map to 'actual' for line chart
  });

  // Merge historical + forecast data for unified x-axis
  const mergedData = [
    ...historicalData,
    ...forecastData.map(d => ({
      label:     d.label ?? d.x ?? '',
      predicted: d.predicted  ?? d.value ?? null,
      lower:     d.lower_bound ?? d.lower ?? null,
      upper:     d.upper_bound ?? d.upper ?? null,
      isForecast: true,
    })),
  ];

  const hasForecast = forecastData.length > 0;

  // For very small datasets show dots so the line is visible
  const showDots = mergedData.length <= 20;
  
  const styles = getChartStyles(isDark);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={styles.gridStroke} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: styles.tickColor, fontSize: 11 }}
          angle={mergedData.length > 8 ? -35 : 0}
          textAnchor={mergedData.length > 8 ? 'end' : 'middle'}
          interval={safeInterval(mergedData.length)}
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

        {/* Main line */}
        <Line
          type="monotone"
          dataKey="actual"
          name={metricName}
          stroke={scheme.primary}
          strokeWidth={2}
          dot={showDots ? { r: 3, fill: scheme.primary, strokeWidth: 0 } : false}
          activeDot={{ r: 5, fill: scheme.primary, stroke: isDark ? '#0a0f1a' : '#ffffff', strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={800}
          connectNulls
        />

        {hasForecast && (
          <>
            <Line
              type="monotone"
              dataKey="predicted"
              name="Forecast"
              stroke={scheme.secondary}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
            />
            <Line type="monotone" dataKey="upper" name="Upper Bound"
              stroke={`${scheme.secondary}50`} strokeWidth={1} dot={false} connectNulls />
            <Line type="monotone" dataKey="lower" name="Lower Bound"
              stroke={`${scheme.secondary}50`} strokeWidth={1} dot={false} connectNulls />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
