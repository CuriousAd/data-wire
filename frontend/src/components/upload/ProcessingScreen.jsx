import { useEffect, useState } from 'react';
import { Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const STEPS = [
  { key: 'parsing', label: 'Parsing CSV structure' },
  { key: 'profiling', label: 'Profiling columns & types' },
  { key: 'indexing', label: 'Indexing data into store' },
  { key: 'ready', label: 'Finalizing & AI-prepping' },
];

export function ProcessingScreen() {
  const { dataset, resetToUpload } = useAppStore();
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Animate through visual steps (independent of actual backend steps)
  useEffect(() => {
    if (stepIdx < STEPS.length - 1) {
      const t = setTimeout(() => setStepIdx(i => i + 1), 3500);
      return () => clearTimeout(t);
    }
  }, [stepIdx]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtElapsed = (s) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', filter: 'blur(100px)' }} />
      </div>

      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* File info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={18} className="text-cyan-400" />
            <span className="text-lg font-bold gradient-text">Processing Dataset</span>
          </div>
          <p className="text-slate-400 text-sm truncate px-4">{dataset?.filename || 'your file'}</p>
          <p className="text-slate-600 text-xs mt-1">{fmtElapsed(elapsed)} elapsed</p>
        </div>

        {/* Animated ring */}
        <div className="flex justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="6" />
              {/* Animated arc */}
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * (stepIdx + 1) / STEPS.length)}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{Math.round(((stepIdx + 1) / STEPS.length) * 100)}%</span>
              <span className="text-xs text-slate-500">done</span>
            </div>
          </div>
        </div>

        {/* Steps list */}
        <div className="glass rounded-2xl p-5 space-y-3">
          {STEPS.map((step, idx) => {
            const isDone = idx < stepIdx;
            const isActive = idx === stepIdx;
            const isPending = idx > stepIdx;
            return (
              <div key={step.key} className={`flex items-center gap-3 transition-all duration-500 ${isPending ? 'opacity-30' : ''}`}>
                {isDone ? (
                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                ) : isActive ? (
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                )}
                <span className={`text-sm ${isActive ? 'text-cyan-400 font-medium' : isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <div className="ml-auto flex gap-1">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-600">
          Hang tight — this usually takes 15–60 seconds depending on dataset size.
        </p>

        {/* Escape hatch */}
        <div className="flex justify-center">
          <button
            onClick={resetToUpload}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            id="cancel-processing-btn"
          >
            <RefreshCw size={12} />
            Cancel & re-upload
          </button>
        </div>
      </div>
    </div>
  );
}
