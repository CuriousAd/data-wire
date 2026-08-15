import { useRef, useCallback, useEffect, useState } from 'react';
import { Plus, FileSpreadsheet, CheckCircle, AlertCircle, Home, FileSearch, DatabaseZap, ChartNoAxesCombined, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useUpload } from '../../hooks/useUpload';
import { getDatasetStatus } from '../../api/status';
import toast from 'react-hot-toast';

// ── Phase config: maps backend processing_phase → icon + label ─────────────
const PHASE_CFG = {
  parsing:   { icon: FileSearch,            label: 'Parsing CSV structure…' },
  profiling: { icon: ChartNoAxesCombined,   label: 'Analyzing column statistics…' },
  loading:   { icon: DatabaseZap,           label: 'Loading into database…' },
};

const STATUS_CFG = {
  uploading:  { icon: Loader2,      color: 'text-amber-600',   label: 'Uploading…',  spin: true },
  processing: { icon: Loader2,      color: 'text-[#1a3c2e]',   label: 'Processing…', spin: true },
  ready:      { icon: CheckCircle,  color: 'text-emerald-600', label: 'Ready' },
  error:      { icon: AlertCircle,  color: 'text-red-500',     label: 'Error' },
};

const POLL_INTERVAL = 2000;
const MAX_POLL = 150;
// Estimated total processing time (seconds) used for the progress bar animation
const ESTIMATED_PROCESSING_S = 20;

// ── Deterministic progress bar ─────────────────────────────────────────────
function ProcessingCard({ ds }) {
  const [progress, setProgress] = useState(0);

  // Advance the progress bar smoothly based on elapsed time and backend phase
  useEffect(() => {
    const start = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      // Time-based: fills to 50% over ESTIMATED_PROCESSING_S / 2
      let timeProgress = Math.min(0.5, elapsed / ESTIMATED_PROCESSING_S);

      // Phase-based bonus: jump ahead when backend emits a later phase
      let phaseBonus = 0;
      if (ds.processingPhase === 'profiling') phaseBonus = 0.25;
      if (ds.processingPhase === 'loading')   phaseBonus = 0.45;

      const combined = Math.min(0.9, timeProgress + phaseBonus);
      setProgress(combined);
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [ds.processingPhase]);

  const phaseCfg = PHASE_CFG[ds.processingPhase] || PHASE_CFG.parsing;
  const PhaseIcon = phaseCfg.icon;

  return (
    <div className="w-full text-left px-3 py-3 rounded-xl border border-[#e5e0da] bg-white/60 space-y-2">
      <div className="flex items-center gap-2 min-w-0">
        <FileSpreadsheet size={13} className="text-[#a8a29e] flex-shrink-0" />
        <span className="truncate font-medium text-[11px] text-[#4a4a4a]">{ds.filename}</span>
      </div>

      {/* Phase label with icon */}
      <div className="flex items-center gap-1.5 ml-[21px]">
        <PhaseIcon size={11} className="text-[#1a3c2e] flex-shrink-0 animate-pulse" />
        <span className="text-[10px] text-[#1a3c2e]">{phaseCfg.label}</span>
      </div>

      {/* Progress bar */}
      <div className="ml-[21px] h-[3px] w-full bg-[#ece8e2] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1a3c2e] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function LeftPanel({ isMobileFullWidth = false }) {
  const { datasets, activeDatasetId, switchDataset, resetToHome, updateDataset } = useAppStore();
  const { isUploading, handleUpload } = useUpload();
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // Auto-poll any dataset stuck in "processing" — this runs in the workspace
  // which stays mounted, unlike InputCard which gets unmounted on navigation.
  useEffect(() => {
    const processing = datasets.find(d => d.status === 'processing');
    if (!processing) return;

    let attempts = 0;
    const poll = async () => {
      try {
        const res = await getDatasetStatus(processing.id);
        if (res.status === 'ready') {
          updateDataset(processing.id, {
            status: 'ready',
            processingPhase: null,
            rowCount: res.row_count,
            columnCount: res.column_count,
            profile: res.profile,
          });
          toast.success('Dataset ready!');
          return;
        }
        if (res.status === 'error') {
          updateDataset(processing.id, { status: 'error', processingPhase: null });
          toast.error(res.message || 'Processing failed.');
          return;
        }
        // Update the phase so the progress bar and icon can react
        if (res.processing_phase) {
          updateDataset(processing.id, { processingPhase: res.processing_phase });
        }
        attempts++;
        if (attempts >= MAX_POLL) {
          updateDataset(processing.id, { status: 'error', processingPhase: null });
          toast.error('Processing timed out.');
          return;
        }
        pollRef.current = setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        updateDataset(processing.id, { status: 'error', processingPhase: null });
        toast.error(err.message || 'Status check failed.');
      }
    };
    pollRef.current = setTimeout(poll, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [datasets, updateDataset]);

  const onFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    e.target.value = '';
  }, [handleUpload]);

  return (
    <div className={`h-full flex flex-col bg-[#f5f2ed] ${isMobileFullWidth ? '' : 'border-r border-[#e5e0da]'}`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#e5e0da]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#1a1a1a]">DataWire</span>
          <button onClick={resetToHome} title="Back to Home" className="p-1.5 rounded-lg hover:bg-[#ece8e2] text-[#8a8580] hover:text-[#1a1a1a] transition-colors">
            <Home size={14} />
          </button>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex items-center justify-center gap-2 px-4 rounded-xl bg-[#1a3c2e] text-white text-[12px] font-medium hover:bg-[#142e23] transition-colors disabled:opacity-50 ${
            isMobileFullWidth ? 'py-3' : 'py-2.5'
          }`}
        >
          {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          {isUploading ? 'Uploading…' : 'Upload CSV'}
        </button>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFile} />
      </div>

      {/* Dataset list */}
      <div className="flex-1 overflow-y-auto touch-scroll px-3 py-3">
        <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#a8a29e] px-1 mb-2">Datasets</p>
        <div className="space-y-1.5">
          {datasets.length === 0 && (
            <p className="text-[11px] text-[#b5b0aa] px-2 py-6 text-center">No datasets yet</p>
          )}
          {datasets.map(ds => {
            // Render the phase-aware progress card for processing datasets
            if (ds.status === 'processing') {
              return <ProcessingCard key={ds.id} ds={ds} />;
            }

            const active = ds.id === activeDatasetId;
            const cfg = STATUS_CFG[ds.status] || STATUS_CFG.ready;
            const Icon = cfg.icon;
            return (
              <button
                key={ds.id}
                onClick={() => ds.status === 'ready' && switchDataset(ds.id)}
                disabled={ds.status !== 'ready'}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-[11px] ${
                  active ? 'bg-[#dfeee6] border border-[#1a3c2e]/15' : 'hover:bg-[#ece8e2] border border-transparent'
                } disabled:cursor-default`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet size={13} className={active ? 'text-[#1a3c2e]' : 'text-[#a8a29e]'} />
                  <span className={`truncate font-medium ${active ? 'text-[#1a3c2e]' : 'text-[#4a4a4a]'}`}>{ds.filename}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-[21px]">
                  <Icon size={10} className={`${cfg.color} ${cfg.spin ? 'animate-spin' : ''} flex-shrink-0`} />
                  <span className={`text-[10px] ${cfg.color}`}>
                    {ds.status === 'ready' && ds.rowCount ? `${ds.rowCount.toLocaleString()} rows · ${ds.columnCount} cols` : cfg.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
