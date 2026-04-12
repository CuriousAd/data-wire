import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import { getScheme } from '../../utils/colorSchemes';
import { CustomTooltip } from './ChartTooltip';

export function LineChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const historicalData = vizConfig.data || [];
  const forecastData = vizConfig.forecast || [];

  // Merge historical + forecast data for unified x-axis
  const mergedData = [
    ...historicalData.map(d => ({ label: d.label, actual: d.value, highlighted: d.highlighted })),
    ...forecastData.map(d => ({
      label: d.label,
      predicted: d.predicted,
      lower: d.lower_bound,
      upper: d.upper_bound,
      isForecast: true,
    })),
  ];

  const hasForecast = forecastData.length > 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={Math.floor(mergedData.length / 8)}
          label={vizConfig.x_label ? { value: vizConfig.x_label, position: 'insideBottom', offset: -30, fill: '#64748b', fontSize: 11 } : undefined}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          label={vizConfig.y_label ? { value: vizConfig.y_label, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        {vizConfig.show_legend && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}

        <Line
          type="monotone"
          dataKey="actual"
          name={vizConfig.y_label || 'Value'}
          stroke={scheme.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: scheme.primary }}
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
            />
            <Line type="monotone" dataKey="upper" name="Upper Bound" stroke={`${scheme.secondary}50`} strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="lower" name="Lower Bound" stroke={`${scheme.secondary}50`} strokeWidth={1} dot={false} />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
