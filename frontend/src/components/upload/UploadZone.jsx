import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Zap, Database, Brain } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

const FEATURES = [
  { icon: Brain, label: 'AI-Powered Analysis', desc: 'Multi-agent reasoning over your data' },
  { icon: Zap, label: 'Real-time Insights', desc: 'Streaming responses as AI thinks' },
  { icon: Database, label: 'Any CSV Dataset', desc: 'Up to 100MB, any structure' },
];

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { isUploading, handleUpload } = useUpload();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
    }
  }, [handleUpload]);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', filter: 'blur(80px)' }} />

      {/* Logo + heading */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Data-Wire</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
          Chat with your data
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Upload any CSV and ask questions in plain English — AI will analyze it and generate instant visualizations.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone w-full max-w-xl p-12 flex flex-col items-center gap-5 animate-slide-up ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        id="csv-upload-dropzone"
        role="button"
        aria-label="Upload CSV file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
          id="csv-file-input"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-slow"
              style={{ background: 'linear-gradient(135deg, #06b6d440, #8b5cf640)' }}>
              <Upload size={24} className="text-cyan-400" />
            </div>
            <p className="text-cyan-400 font-semibold">Uploading…</p>
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e30, #06b6d430)' }}>
              <FileText size={24} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold">{selectedFile.name}</p>
            <p className="text-slate-500 text-sm">{formatSize(selectedFile.size)}</p>
          </div>
        ) : (
          <>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}
              style={{ background: isDragging ? 'linear-gradient(135deg, #06b6d440, #8b5cf640)' : 'rgba(34,211,238,0.08)' }}
            >
              <Upload size={28} className={isDragging ? 'text-cyan-400' : 'text-slate-500'} />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">
                {isDragging ? 'Release to upload' : 'Drop your CSV here'}
              </p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50">.csv only</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50">Max 100 MB</span>
            </div>
          </>
        )}
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="glass rounded-xl px-4 py-3 flex items-center gap-3 text-sm max-w-xs">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,211,238,0.1)' }}>
              <Icon size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium leading-tight">{label}</p>
              <p className="text-slate-500 text-xs">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
