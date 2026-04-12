import { BarChartViz } from './BarChartViz';
import { LineChartViz } from './LineChartViz';
import { PieChartViz } from './PieChartViz';
import { ScatterChartViz } from './ScatterChartViz';
import { AreaChartViz } from './AreaChartViz';
import { ComposedChartViz } from './ComposedChartViz';
import { MapChartViz } from './MapChartViz';
import { TableViz } from './TableViz';
import { BarChart2, AlertTriangle } from 'lucide-react';

const VIZ_COMPONENTS = {
  bar: BarChartViz,
  line: LineChartViz,
  pie: PieChartViz,
  scatter: ScatterChartViz,
  area: AreaChartViz,
  composed: ComposedChartViz,
  map: MapChartViz,
  table: TableViz,
};

export function ChartRenderer({ vizConfig }) {
  if (!vizConfig || !vizConfig.viz_type) {
    return null;
  }

  const Component = VIZ_COMPONENTS[vizConfig.viz_type];

  if (!Component) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
        <AlertTriangle size={16} className="text-amber-500" />
        <span>Unsupported visualization type: <code className="font-mono text-xs">{vizConfig.viz_type}</code></span>
      </div>
    );
  }

  return (
    <div className="mt-4 animate-fade-in">
      {/* Chart header */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} className="text-cyan-400 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-slate-300 truncate">{vizConfig.title}</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 capitalize flex-shrink-0">
          {vizConfig.viz_type}
        </span>
      </div>
      {/* Chart body */}
      <div
        className="rounded-xl p-3"
        style={{ background: 'rgba(10,15,26,0.6)', border: '1px solid rgba(34,211,238,0.07)' }}
      >
        <Component vizConfig={vizConfig} />
      </div>
    </div>
  );
}
