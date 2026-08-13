import { Settings } from 'lucide-react';

const SAMPLES = [
  {
    label: 'Sample 1',
    text: 'Analyze quarterly sales trends and pinpoint top-performing product categories.',
  },
  {
    label: 'Sample 2',
    text: 'Forecast product price movements and key revenue drivers for the coming year.',
  },
  {
    label: 'Sample 3',
    text: 'Detect churn drivers and highlight high-risk account segments.',
  },
];

export function PreviewPanel() {
  return (
    <div className="bg-[#1c3f35] rounded-[20px] sm:rounded-[26px] p-5 sm:p-7">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
        <Settings size={15} className="text-white/50" />
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-white/65">
          Orchestration Preview
        </span>
      </div>

      {/* Sample cards */}
      <div className="space-y-3 sm:space-y-3.5">
        {SAMPLES.map((sample, i) => (
          <div
            key={i}
            className="bg-[#265245] rounded-[14px] sm:rounded-[16px] px-4 sm:px-5 py-4 sm:py-5 border border-white/[0.06]"
          >
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#d4775e] mb-1.5 sm:mb-2">
              {sample.label}
            </p>
            <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed">
              {sample.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
