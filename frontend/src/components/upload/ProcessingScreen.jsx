import { useEffect, useState } from 'react';
import { Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const STEPS = [
  { key: 'parsing',   label: 'Parsing CSV structure' },
  { key: 'profiling', label: 'Profiling columns & types' },
  { key: 'indexing',  label: 'Indexing data into store' },
  { key: 'ready',     label: 'Finalizing & AI-prepping' },
];

const STATUS_MESSAGES = [
  'Crunching numbers…',
  'Teaching the AI about your data…',
  'Mapping column relationships…',
  'Detecting data patterns…',
  'Calibrating analysis engines…',
  'Asking the AI to think hard…',
  'Almost there, hang tight!',
];

/** A single orbit dot spinning around the ring at a given delay offset */
function OrbitDot({ delay, color = '#22d3ee' }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 8,
        height: 8,
        marginTop: -4,
        marginLeft: -4,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
        transformOrigin: '0 0',
        animation: `orbitSpin 2.4s linear ${delay} infinite`,
      }}
    />
  );
}

export function ProcessingScreen() {
  const { dataset, resetToUpload } = useAppStore();
  const [stepIdx, setStepIdx]           = useState(0);
  const [elapsed, setElapsed]           = useState(0);
  const [statusIdx, setStatusIdx]       = useState(0);

  // Animate through visual steps
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

  // Rotate through fun status messages
  useEffect(() => {
    const t = setInterval(() => setStatusIdx(i => (i + 1) % STATUS_MESSAGES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const fmtElapsed = (s) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);
  const ringCircum = 264;
  const ringOffset = ringCircum - (ringCircum * (stepIdx + 1) / STEPS.length);

  // Glow intensity scales with progress
  const ringGlow = `0 0 ${20 + pct * 0.4}px rgba(34,211,238,${0.15 + pct * 0.003})`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', filter: 'blur(100px)' }}
        />
      </div>

      <div className="w-full max-w-md space-y-8" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* File info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={18} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
            <span className="text-lg font-bold gradient-text">Processing Dataset</span>
          </div>
          <p className="text-slate-400 text-sm truncate px-4">{dataset?.filename || 'your file'}</p>
          <p className="text-slate-600 text-xs mt-1">{fmtElapsed(elapsed)} elapsed</p>
        </div>

        {/* Animated ring with orbit dots */}
        <div className="flex justify-center">
          <div className="relative w-28 h-28" style={{ filter: ringGlow }}>

            {/* SVG ring */}
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
                strokeDasharray={ringCircum}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>

            {/* Orbit dots layer (positioned on top via absolute) */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ width: '112px', height: '112px', top: 0, left: 0 }}
            >
              <OrbitDot delay="0s"    color="#22d3ee" />
              <OrbitDot delay="-0.8s" color="#a78bfa" />
              <OrbitDot delay="-1.6s" color="#34d399" />
            </div>

            {/* Percent text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white" style={{ transition: 'all 0.5s' }}>{pct}%</span>
              <span className="text-xs text-slate-500">done</span>
            </div>
          </div>
        </div>

        {/* Rotating fun status message */}
        <div className="text-center h-6 overflow-hidden">
          <p
            key={statusIdx}
            className="text-xs text-slate-500 italic"
            style={{ animation: 'fadeIn 0.4s ease both' }}
          >
            {STATUS_MESSAGES[statusIdx]}
          </p>
        </div>

        {/* Steps list — each step reveals with animation */}
        <div className="glass rounded-2xl p-5 space-y-3">
          {STEPS.map((step, idx) => {
            const isDone   = idx < stepIdx;
            const isActive = idx === stepIdx;
            const isPending = idx > stepIdx;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 transition-opacity duration-500 ${isPending ? 'opacity-30' : ''}`}
                style={isActive ? { animation: 'stepReveal 0.35s cubic-bezier(0.16,1,0.3,1) both' } : {}}
              >
                {isDone ? (
                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 3px rgba(52,211,153,0.5))' }} />
                ) : isActive ? (
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                )}

                <span
                  className={`text-sm transition-all duration-300 ${
                    isActive  ? 'text-cyan-400 font-medium' :
                    isDone    ? 'text-slate-400' :
                    'text-slate-600'
                  }`}
                  style={isActive ? { textShadow: '0 0 8px rgba(34,211,238,0.4)' } : {}}
                >
                  {step.label}
                </span>

                {isActive && (
                  <div className="ml-auto flex gap-1">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                )}

                {isDone && (
                  <div
                    className="ml-auto text-xs text-emerald-600"
                    style={{ animation: 'fadeIn 0.3s ease' }}
                  >
                    ✓
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
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-300 transition-all duration-200 hover:gap-2"
            id="cancel-processing-btn"
          >
            <RefreshCw size={12} className="transition-transform hover:rotate-180 duration-500" />
            Cancel & re-upload
          </button>
        </div>
      </div>
    </div>
  );
}
