import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';
import { compactNumber } from '../../utils/formatters';

/**
 * Normalise one data point from the backend.
 * Backend may send { label, value } OR { label, actual } OR { label, y } – handle all.
 */
function normalise(d) {
  return {
    label:       d.label ?? d.x ?? d.name ?? '',
    actual:      d.value  ?? d.actual ?? d.y ?? null,
    highlighted: d.highlighted ?? false,
  };
}

/**
 * Compute a safe XAxis interval that avoids label collisions.
 * Returns 'preserveStartEnd' for large datasets, 0 for small ones.
 */
function safeInterval(len) {
  if (len <= 12) return 0;
  return Math.max(1, Math.floor(len / 8));
}

export function LineChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const rawHistorical = vizConfig.data || [];
  const forecastData  = vizConfig.forecast || [];

  const metricName = vizConfig.y_label || vizConfig.title || 'Metric';

  // Normalise historical data so both { label, value } and { label, actual } work
  const historicalData = rawHistorical.map(normalise);

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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          angle={mergedData.length > 8 ? -35 : 0}
          textAnchor={mergedData.length > 8 ? 'end' : 'middle'}
          interval={safeInterval(mergedData.length)}
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

        {/* Main line */}
        <Line
          type="monotone"
          dataKey="actual"
          name={metricName}
          stroke={scheme.primary}
          strokeWidth={2}
          dot={showDots ? { r: 3, fill: scheme.primary, strokeWidth: 0 } : false}
          activeDot={{ r: 5, fill: scheme.primary, stroke: '#0a0f1a', strokeWidth: 2 }}
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
