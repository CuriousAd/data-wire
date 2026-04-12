import { useState, useEffect, useCallback } from 'react';
import { BarChartViz } from './BarChartViz';
import { LineChartViz } from './LineChartViz';
import { PieChartViz } from './PieChartViz';
import { ScatterChartViz } from './ScatterChartViz';
import { AreaChartViz } from './AreaChartViz';
import { ComposedChartViz } from './ComposedChartViz';
import { MapChartViz } from './MapChartViz';
import { TableViz } from './TableViz';
import { BarChart2, Maximize2, X, RefreshCw } from 'lucide-react';

const VIZ_COMPONENTS = {
  // Primary types
  bar:         BarChartViz,
  line:        LineChartViz,
  pie:         PieChartViz,
  scatter:     ScatterChartViz,
  area:        AreaChartViz,
  composed:    ComposedChartViz,
  map:         MapChartViz,
  table:       TableViz,
  // Common aliases the backend may return
  trend:        LineChartViz,
  trending:     LineChartViz,
  timeseries:   LineChartViz,
  time_series:  LineChartViz,
  histogram:    BarChartViz,
  column:       BarChartViz,
  donut:        PieChartViz,
  doughnut:     PieChartViz,
};

/** Ordered list of switchable chart types (map & table excluded — incompatible data shapes) */
const SWITCHABLE_TYPES = ['bar', 'line', 'area', 'scatter', 'pie'];

/**
 * Resolve the canonical component for a given viz_type string,
 * falling back to bar if unknown.
 */
function resolveComponent(vizType) {
  return VIZ_COMPONENTS[vizType] || VIZ_COMPONENTS[vizType?.toLowerCase()] || BarChartViz;
}

export function ChartRenderer({ vizConfig }) {
  const [isExpanded,    setIsExpanded]    = useState(false);
  const [activeType,    setActiveType]    = useState(vizConfig?.viz_type);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Sync if vizConfig changes
  useEffect(() => {
    setActiveType(vizConfig?.viz_type);
  }, [vizConfig?.viz_type]);

  // Close expanded on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const cycleType = useCallback(() => {
    const idx = SWITCHABLE_TYPES.indexOf(activeType);
    if (idx === -1) return; // incompatible type, don't switch
    setActiveType(SWITCHABLE_TYPES[(idx + 1) % SWITCHABLE_TYPES.length]);
    setShowTypePicker(false);
  }, [activeType]);

  if (!vizConfig || !vizConfig.viz_type) return null;

  // activeType starts as vizConfig.viz_type but can be changed by the switcher.
  // Resolve the component for whichever type is currently active.
  const Component = resolveComponent(activeType);

  // The canonical type (after alias resolution) — used for canSwitch logic
  const canonicalType = SWITCHABLE_TYPES.includes(vizConfig.viz_type)
    ? vizConfig.viz_type
    : SWITCHABLE_TYPES.includes(activeType)
    ? activeType
    : null;

  const canSwitch = !!canonicalType;

  /** Shared header row used in both inline and expanded views */
  function ChartHeader({ onExpand, expanded }) {
    const headerTextClass = expanded ? 'text-slate-200' : 'text-slate-800';
    const btnClass = expanded 
      ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-cyan-500/40 hover:text-slate-200'
      : 'bg-white text-slate-600 border-[#e5e0da] hover:border-slate-400 hover:text-slate-900 border';

    const disabledBtnClass = expanded
      ? 'bg-slate-800/50 text-slate-500 border-slate-800'
      : 'bg-slate-50 text-slate-400 border-[#e5e0da] border';

    const expandBtnClass = expanded
      ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
      : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200';

    const pickerBgClass = expanded ? 'glass-strong border border-cyan-500/20' : 'bg-white border border-[#e5e0da] shadow-lg';
    
    return (
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} className={expanded ? "text-cyan-400 flex-shrink-0" : "text-emerald-500 flex-shrink-0"} />
        <h3 className={`text-sm font-semibold truncate ${headerTextClass}`}>{vizConfig.title}</h3>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Chart type badge / switcher */}
          <div className="relative">
            <button
              onClick={() => canSwitch && setShowTypePicker(p => !p)}
              className={`text-xs px-2 py-0.5 rounded-md capitalize flex items-center gap-1 transition-all duration-200 ${
                canSwitch ? `${btnClass} cursor-pointer` : `${disabledBtnClass} cursor-default`
              }`}
              title={canSwitch ? 'Switch chart type' : 'Chart type'}
            >
              {activeType}
              {canSwitch && <RefreshCw size={10} className="opacity-60" />}
            </button>

            {/* Type picker dropdown */}
            {showTypePicker && canSwitch && (
              <div
                className={`absolute right-0 top-full mt-1 z-30 rounded-xl p-1.5 min-w-[110px] ${pickerBgClass}`}
                style={{ animation: 'slideUp 0.18s cubic-bezier(0.16,1,0.3,1)' }}
              >
                {SWITCHABLE_TYPES.map(t => {
                  const isMatch = t === activeType;
                  const itemClass = expanded 
                    ? (isMatch ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5')
                    : (isMatch ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100');
                    
                  return (
                    <button
                      key={t}
                      onClick={() => { setActiveType(t); setShowTypePicker(false); }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg capitalize transition-colors ${itemClass}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expand button — always visible */}
          {!expanded && (
            <button
              onClick={onExpand}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${expandBtnClass}`}
              title="Expand Chart (Full Screen)"
            >
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inline chart container */}
      <div className="mt-4 relative" style={{ animation: 'fadeIn 0.4s ease both' }}>
        <ChartHeader onExpand={() => setIsExpanded(true)} expanded={false} />

        <div
          className="rounded-xl p-3 relative transition-all duration-200 hover:border-slate-300"
          style={{ background: 'transparent', border: '1px solid transparent' }}
          onClick={() => showTypePicker && setShowTypePicker(false)}
        >
          {/* Pass vizConfig as-is; each chart normalises its own keys internally */}
          <Component vizConfig={vizConfig} activeType={activeType} isDark={false} />
        </div>
      </div>

      {/* Expanded modal overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm"
          style={{ background: 'rgba(5,9,18,0.85)', animation: 'fadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) setIsExpanded(false); }}
        >
          <div
            className="w-full max-w-6xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden glass-strong border border-slate-700"
            role="dialog"
            aria-modal="true"
            style={{ animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/50">
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
                  <BarChart2 size={16} className="text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-200 truncate">{vizConfig.title}</h2>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <ChartHeader onExpand={() => {}} expanded={true} />
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  title="Close (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal body — ResponsiveContainer needs an explicit height, not 100% in a flex child */}
            <div className="flex-1 p-6 sm:p-8 bg-slate-900/40" style={{ minHeight: 0 }}>
              <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
                <Component vizConfig={vizConfig} activeType={activeType} isDark={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
