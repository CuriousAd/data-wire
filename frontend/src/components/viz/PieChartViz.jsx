import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getScheme } from '../../utils/colorSchemes';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export function PieChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme);
  const data = vizConfig.data || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={110}
          innerRadius={50}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.highlighted ? scheme.secondary : scheme.colors[idx % scheme.colors.length]}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#0f1728', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 8, color: '#e2e8f0' }}
          formatter={(val) => [val.toLocaleString(), '']}
        />
        {vizConfig.show_legend && (
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
