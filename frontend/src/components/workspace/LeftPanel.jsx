import { useRef, useCallback } from 'react';
import { Plus, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useUpload } from '../../hooks/useUpload';

const STATUS_CFG = {
  uploading:  { icon: Loader2, color: 'text-amber-600', label: 'Uploading…', spin: true },
  processing: { icon: Loader2, color: 'text-[#1a3c2e]', label: 'Processing…', spin: true },
  ready:      { icon: CheckCircle, color: 'text-emerald-600', label: 'Ready' },
  error:      { icon: AlertCircle, color: 'text-red-500', label: 'Error' },
};

export function LeftPanel() {
  const { datasets, activeDatasetId, switchDataset, resetToHome } = useAppStore();
  const { isUploading, handleUpload } = useUpload();
  const inputRef = useRef(null);

  const onFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    e.target.value = '';
  }, [handleUpload]);

  return (
    <div className="h-full flex flex-col bg-[#f5f2ed] border-r border-[#e5e0da]">
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a3c2e] text-white text-[12px] font-medium hover:bg-[#142e23] transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          {isUploading ? 'Uploading…' : 'Upload CSV'}
        </button>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFile} />
      </div>

      {/* Dataset list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#a8a29e] px-1 mb-2">Datasets</p>
        <div className="space-y-1">
          {datasets.length === 0 && (
            <p className="text-[11px] text-[#b5b0aa] px-2 py-6 text-center">No datasets yet</p>
          )}
          {datasets.map(ds => {
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
