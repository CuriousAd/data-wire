import { useRef, useEffect } from 'react';
import { BarChart2, Table } from 'lucide-react';
import { ChartRenderer } from '../viz/ChartRenderer';
import { useAppStore } from '../../store/appStore';

// ── Shimmer skeleton shown while the dataset is still being processed ───────
function SkeletonPulse({ className }) {
  return <div className={`bg-[#ece8e2] rounded animate-pulse ${className}`} />;
}

function ProcessingSkeleton() {
  return (
    <div className="h-full bg-[#faf8f5] p-3 sm:p-4 lg:p-6 space-y-4">
      {/* Skeleton chart card */}
      <div className="bg-white rounded-xl border border-[#e5e0da] p-4 sm:p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <SkeletonPulse className="h-3.5 w-36 rounded-full" />
          <SkeletonPulse className="h-7 w-7 rounded-lg" />
        </div>
        {/* Fake bar chart */}
        <div className="flex items-end gap-2 h-36 px-2">
          {[55, 80, 45, 95, 65, 72, 38, 85, 60, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#dfeee6] rounded-t animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        {/* X-axis labels */}
        <div className="flex gap-2 mt-2 px-2">
          {[...Array(10)].map((_, i) => (
            <SkeletonPulse key={i} className="flex-1 h-2 rounded-full" />
          ))}
        </div>
      </div>

      {/* Skeleton text card */}
      <div className="bg-white rounded-xl border border-[#e5e0da] p-4 sm:p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)] space-y-2.5">
        <SkeletonPulse className="h-3 w-48 rounded-full" />
        <SkeletonPulse className="h-2.5 w-full rounded-full" />
        <SkeletonPulse className="h-2.5 w-5/6 rounded-full" />
        <SkeletonPulse className="h-2.5 w-4/5 rounded-full" />
        <SkeletonPulse className="h-2.5 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#dfeee6] border border-[#1a3c2e]/10">
        <BarChart2 size={24} className="text-[#1a3c2e]" />
      </div>
      <h2 className="text-xl font-serif font-bold text-[#1a1a1a] mb-1.5">Visual Canvas</h2>
      <p className="text-[13px] text-[#8a8580] max-w-xs leading-relaxed">
        Upload a dataset and ask a question. Charts and visualizations will appear here.
      </p>
    </div>
  );
}

function DatasetPreviewTable({ data }) {
  if (!data?.columns?.length) return null;
  return (
    <div className="overflow-x-auto touch-scroll rounded-lg border border-[#e5e0da]">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="bg-[#f5f2ed]">
            {data.columns.map((c, i) => (
              <th key={i} className="px-3 py-2 font-semibold text-[#1a1a1a] whitespace-nowrap border-b border-[#e5e0da]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-[#faf8f5] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-[#4a4a4a] whitespace-nowrap border-b border-[#f0ebe4]">{String(cell ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CenterPanel() {
  const { centerItems, activeDataset } = useAppStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [centerItems]);

  const isProcessing = activeDataset?.status === 'processing';

  // Show skeleton when processing AND no preview has loaded yet
  if (isProcessing && centerItems.length === 0) {
    return <ProcessingSkeleton />;
  }

  if (centerItems.length === 0) return <div className="h-full bg-[#faf8f5]"><EmptyState /></div>;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto touch-scroll bg-[#faf8f5] p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-5">
      {centerItems.map(item => (
        <div key={item.id} className="bg-white rounded-xl border border-[#e5e0da] p-3 sm:p-4 lg:p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
          {item.type === 'viz' && <ChartRenderer vizConfig={item.content} />}
          {item.type === 'dataset' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Table size={14} className="text-[#1a3c2e]" />
                <h3 className="text-[13px] font-semibold text-[#1a1a1a]">{item.title}</h3>
              </div>
              <DatasetPreviewTable data={item.content} />
            </>
          )}
        </div>
      ))}

      {/* Skeleton card appended below preview while processing continues */}
      {isProcessing && (
        <div className="bg-white rounded-xl border border-[#e5e0da] p-4 sm:p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)] space-y-2.5">
          <div className="flex items-center gap-2 mb-3">
            <SkeletonPulse className="h-3.5 w-32 rounded-full" />
          </div>
          <SkeletonPulse className="h-2.5 w-full rounded-full" />
          <SkeletonPulse className="h-2.5 w-4/5 rounded-full" />
          <SkeletonPulse className="h-2.5 w-3/4 rounded-full" />
        </div>
      )}
    </div>
  );
}
