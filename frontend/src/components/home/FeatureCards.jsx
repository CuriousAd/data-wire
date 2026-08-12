import { Upload, Brain, BarChart3, ChevronRight } from 'lucide-react';

const STEPS = [
  { icon: Upload, label: 'Upload CSV', accent: '#1a3c2e' },
  { icon: Brain, label: 'AI Agents Analyze', accent: '#2d5a45' },
  { icon: BarChart3, label: 'Insights & Charts', accent: '#3a7159' },
];

export function FeatureCards() {
  return (
    <div className="bg-white rounded-[22px] p-6 shadow-[0_2px_24px_rgba(0,0,0,0.05)] border border-[#e8e3dd]">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
              style={{ backgroundColor: step.accent + '12' }}
            >
              <step.icon size={16} style={{ color: step.accent }} />
            </div>
            <span className="text-[12px] font-medium text-[#1a1a1a] leading-tight">
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-[#c5c0ba] flex-shrink-0 ml-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
