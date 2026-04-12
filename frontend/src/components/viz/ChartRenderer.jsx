import { useState, useEffect } from 'react';
import { BarChartViz } from './BarChartViz';
import { LineChartViz } from './LineChartViz';
import { PieChartViz } from './PieChartViz';
import { ScatterChartViz } from './ScatterChartViz';
import { AreaChartViz } from './AreaChartViz';
import { ComposedChartViz } from './ComposedChartViz';
import { MapChartViz } from './MapChartViz';
import { TableViz } from './TableViz';
import { BarChart2, AlertTriangle, Maximize2, X } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

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
    <>
      {/* Inline Chart Container */}
      <div className="mt-4 animate-fade-in relative group">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={14} className="text-cyan-400 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-slate-300 truncate">{vizConfig.title}</h3>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 capitalize flex-shrink-0">
              {vizConfig.viz_type}
            </span>
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
              title="Expand Chart (Full Screen)"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>
        
        <div
          className="rounded-xl p-3 relative"
          style={{ background: 'rgba(10,15,26,0.6)', border: '1px solid rgba(34,211,238,0.07)' }}
        >
          <Component vizConfig={vizConfig} />
        </div>
      </div>

      {/* Expanded Modal Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm bg-navy-950/80 animate-fade-in">
          <div 
            className="w-full max-w-6xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden glass-strong border border-slate-700"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                  <BarChart2 size={16} className="text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-200">{vizConfig.title}</h2>
                <span className="text-xs px-2 py-1 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/50 capitalize ml-2">
                  {vizConfig.viz_type}
                </span>
              </div>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 p-6 sm:p-8 overflow-hidden bg-slate-900/40">
               <div className="w-full h-full min-h-[400px]">
                  <Component vizConfig={vizConfig} />
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
