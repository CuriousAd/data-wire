import { useState, useEffect, useRef, useCallback } from 'react';
import { BarChartViz } from './BarChartViz';
import { LineChartViz } from './LineChartViz';
import { PieChartViz } from './PieChartViz';
import { ScatterChartViz } from './ScatterChartViz';
import { AreaChartViz } from './AreaChartViz';
import { ComposedChartViz } from './ComposedChartViz';
import { MapChartViz } from './MapChartViz';
import { TableViz } from './TableViz';
import { BarChart2, AlertTriangle, Maximize2, X, Download, RefreshCw } from 'lucide-react';

const VIZ_COMPONENTS = {
  bar:      BarChartViz,
  line:     LineChartViz,
  pie:      PieChartViz,
  scatter:  ScatterChartViz,
  area:     AreaChartViz,
  composed: ComposedChartViz,
  map:      MapChartViz,
  table:    TableViz,
};

/** Ordered list of switchable chart types (map & table excluded — incompatible data shapes) */
const SWITCHABLE_TYPES = ['bar', 'line', 'area', 'scatter', 'pie'];

/** Download the chart container's canvas as a PNG */
async function downloadChartPng(containerEl, title) {
  try {
    // Use html2canvas if available, fallback gracefully
    if (!window.html2canvas) {
      // Lazy-load from CDN
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    const canvas = await window.html2canvas(containerEl, {
      backgroundColor: '#0a0f1a',
      scale: 2,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.warn('Chart download failed:', err);
  }
}

export function ChartRenderer({ vizConfig }) {
  const [isExpanded,    setIsExpanded]    = useState(false);
  const [activeType,    setActiveType]    = useState(vizConfig?.viz_type);
  const [downloading,   setDownloading]   = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const chartBodyRef = useRef(null);

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

  const handleDownload = useCallback(async () => {
    if (!chartBodyRef.current || downloading) return;
    setDownloading(true);
    await downloadChartPng(chartBodyRef.current, vizConfig?.title);
    setDownloading(false);
  }, [vizConfig?.title, downloading]);

  const cycleType = useCallback(() => {
    const idx = SWITCHABLE_TYPES.indexOf(activeType);
    if (idx === -1) return; // incompatible type, don't switch
    setActiveType(SWITCHABLE_TYPES[(idx + 1) % SWITCHABLE_TYPES.length]);
    setShowTypePicker(false);
  }, [activeType]);

  if (!vizConfig || !vizConfig.viz_type) return null;

  const Component = VIZ_COMPONENTS[activeType] || VIZ_COMPONENTS[vizConfig.viz_type];

  if (!Component) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
        <AlertTriangle size={16} className="text-amber-500" />
        <span>Unsupported visualization type: <code className="font-mono text-xs">{vizConfig.viz_type}</code></span>
      </div>
    );
  }

  const canSwitch = SWITCHABLE_TYPES.includes(vizConfig.viz_type);

  /** Shared header row used in both inline and expanded views */
  function ChartHeader({ onExpand, expanded }) {
    return (
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} className="text-cyan-400 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-slate-300 truncate">{vizConfig.title}</h3>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Chart type badge / switcher */}
          <div className="relative">
            <button
              onClick={() => canSwitch && setShowTypePicker(p => !p)}
              className={`text-xs px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 transition-all duration-200 ${
                canSwitch
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-cyan-500/40 hover:text-slate-200 cursor-pointer'
                  : 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-default'
              }`}
              title={canSwitch ? 'Switch chart type' : 'Chart type'}
            >
              {activeType}
              {canSwitch && <RefreshCw size={10} className="opacity-60" />}
            </button>

            {/* Type picker dropdown */}
            {showTypePicker && canSwitch && (
              <div
                className="absolute right-0 top-full mt-1 z-30 glass-strong rounded-xl p-1.5 border border-cyan-500/20 min-w-[110px] shadow-2xl"
                style={{ animation: 'slideUp 0.18s cubic-bezier(0.16,1,0.3,1)' }}
              >
                {SWITCHABLE_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => { setActiveType(t); setShowTypePicker(false); }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg capitalize transition-colors ${
                      t === activeType
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
            title="Download as PNG"
          >
            <Download size={10} className={downloading ? 'animate-bounce' : ''} />
            {downloading ? 'Saving…' : 'PNG'}
          </button>

          {/* Expand button — always visible */}
          {!expanded && (
            <button
              onClick={onExpand}
              className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
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
        <ChartHeader onExpand={() => setIsExpanded(true)} />

        <div
          ref={chartBodyRef}
          className="rounded-xl p-3 relative transition-all duration-200 hover:border-cyan-500/15"
          style={{ background: 'rgba(10,15,26,0.6)', border: '1px solid rgba(34,211,238,0.07)' }}
          onClick={() => showTypePicker && setShowTypePicker(false)}
        >
          <Component vizConfig={{ ...vizConfig, viz_type: activeType }} />
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
                {/* Type switcher in expanded mode */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => canSwitch && setShowTypePicker(p => !p)}
                    className={`text-xs px-2.5 py-1 rounded-md border capitalize flex items-center gap-1 transition-all duration-200 ${
                      canSwitch
                        ? 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-cyan-500/40 hover:text-slate-200 cursor-pointer'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 cursor-default'
                    }`}
                  >
                    {activeType}
                    {canSwitch && <RefreshCw size={10} className="opacity-60" />}
                  </button>
                  {showTypePicker && canSwitch && (
                    <div
                      className="absolute left-0 top-full mt-1 z-30 glass-strong rounded-xl p-1.5 border border-cyan-500/20 min-w-[110px] shadow-2xl"
                      style={{ animation: 'slideUp 0.18s cubic-bezier(0.16,1,0.3,1)' }}
                    >
                      {SWITCHABLE_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => { setActiveType(t); setShowTypePicker(false); }}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg capitalize transition-colors ${
                            t === activeType
                              ? 'text-cyan-400 bg-cyan-500/10'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Download in modal */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all duration-200"
                  title="Download chart as PNG"
                >
                  <Download size={12} className={downloading ? 'animate-bounce' : ''} />
                  {downloading ? 'Saving…' : 'Download PNG'}
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  title="Close (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 p-6 sm:p-8 overflow-hidden bg-slate-900/40">
              <div className="w-full h-full min-h-[400px]">
                <Component vizConfig={{ ...vizConfig, viz_type: activeType }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
