import { Settings } from 'lucide-react';

const SAMPLES = [
  {
    label: 'Sample 1',
    text: 'If a product raises its price next quarter, how will customer sentiment and narrative spread evolve?',
  },
  {
    label: 'Sample 2',
    text: 'If a brand suddenly changes its spokesperson, how might public opinion move?',
  },
  {
    label: 'Sample 3',
    text: 'If a policy enters public debate, which groups are likely to support or oppose it first?',
  },
];

export function PreviewPanel() {
  return (
    <div className="bg-[#1c3f35] rounded-[26px] p-7">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <Settings size={15} className="text-white/50" />
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/65">
          Orchestration Preview
        </span>
      </div>

      {/* Sample cards */}
      <div className="space-y-3.5">
        {SAMPLES.map((sample, i) => (
          <div
            key={i}
            className="bg-[#265245] rounded-[16px] px-5 py-5 border border-white/[0.06]"
          >
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#d4775e] mb-2">
              {sample.label}
            </p>
            <p className="text-[14px] text-white/80 leading-relaxed">
              {sample.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
