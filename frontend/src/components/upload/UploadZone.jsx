import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Zap, Database, Brain } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

const FEATURES = [
  {
    icon: Brain,
    label: 'AI-Powered Analysis',
    desc: 'Multi-agent reasoning over your data',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
  },
  {
    icon: Zap,
    label: 'Real-time Insights',
    desc: 'Streaming responses as AI thinks',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.15)',
  },
  {
    icon: Database,
    label: 'Any CSV Dataset',
    desc: 'Up to 100MB, any structure',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
  },
];

/** Spawn a CSS ripple wave from a click event inside the element. */
function spawnRipple(e, containerRef) {
  const el = containerRef.current;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple-wave';
  Object.assign(ripple.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
  });
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hoveredChip, setHoveredChip] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
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

  const handleZoneClick = useCallback((e) => {
    if (isUploading) return;
    spawnRipple(e, dropZoneRef);
    fileInputRef.current?.click();
  }, [isUploading]);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', filter: 'blur(80px)', animation: 'glowPulse 6s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', filter: 'blur(80px)', animation: 'glowPulse 6s ease-in-out infinite 3s' }}
      />

      {/* Logo + heading — staggered entrance */}
      <div className="text-center mb-10" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* Logo icon with float animation */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-float-badge"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 24px rgba(34,211,238,0.3)', animation: 'floatBadge 3s ease-in-out infinite' }}
          >
            <Zap size={20} className="text-white" />
          </div>
          {/* Logo text with animated underline */}
          <span className="text-2xl font-bold gradient-text logo-underline">Data-Wire</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
          Chat with your data
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Upload any CSV and ask questions in plain English — AI will analyze it and generate instant visualizations.
        </p>
      </div>

      {/* Drop Zone — with ripple + orbit icon ring */}
      <div
        ref={dropZoneRef}
        className={`drop-zone ripple-container w-full max-w-xl p-12 flex flex-col items-center gap-5 ${isDragging ? 'dragging' : ''}`}
        style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleZoneClick}
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
            {/* Animated orbit icon */}
            <div className="relative w-16 h-16">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #06b6d440, #8b5cf640)', animation: 'pulse 1.5s ease-in-out infinite' }}
              >
                <Upload size={24} className="text-cyan-400" />
              </div>
              {/* Orbit ring */}
              <div className="absolute inset-0" style={{ animation: 'orbitSpin 1.8s linear infinite' }}>
                <div style={{
                  position: 'absolute', top: '-4px', left: '50%', marginLeft: '-4px',
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#22d3ee', boxShadow: '0 0 6px #22d3ee',
                }} />
              </div>
            </div>
            <p className="text-cyan-400 font-semibold">Uploading…</p>
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>

        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3" style={{ animation: 'slideUp 0.4s ease both' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e30, #06b6d430)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <FileText size={24} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold">{selectedFile.name}</p>
            <p className="text-slate-500 text-sm">{formatSize(selectedFile.size)}</p>
          </div>

        ) : (
          <>
            {/* Orbit icon container */}
            <div className="relative w-16 h-16 group">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}
                style={{
                  background: isDragging
                    ? 'linear-gradient(135deg, #06b6d440, #8b5cf640)'
                    : 'rgba(34,211,238,0.08)',
                }}
              >
                <Upload size={28} className={`transition-colors duration-300 ${isDragging ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              </div>
              {/* Hover orbit ring */}
              {isDragging && (
                <div className="absolute inset-0" style={{ animation: 'orbitSpin 2s linear infinite' }}>
                  <div style={{
                    position: 'absolute', top: '-5px', left: '50%', marginLeft: '-4px',
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#22d3ee', boxShadow: '0 0 8px #22d3ee',
                  }} />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-white font-semibold text-lg">
                {isDragging ? 'Release to upload' : 'Drop your CSV here'}
              </p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors">.csv only</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors">Max 100 MB</span>
            </div>
          </>
        )}
      </div>

      {/* Feature chips — interactive hover cards with stagger */}
      <div className="flex flex-wrap justify-center gap-4 mt-8" style={{ animation: 'fadeIn 0.6s ease 0.25s both' }}>
        {FEATURES.map(({ icon: Icon, label, desc, color, glow }, idx) => (
          <div
            key={label}
            className="glass rounded-xl px-4 py-3 flex items-center gap-3 text-sm cursor-default transition-all duration-300"
            style={{
              animationDelay: `${0.3 + idx * 0.08}s`,
              animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
              animationDelay: `${0.3 + idx * 0.08}s`,
              ...(hoveredChip === idx ? {
                border: `1px solid ${color}40`,
                boxShadow: `0 0 24px ${glow}`,
                transform: 'translateY(-2px)',
              } : {}),
            }}
            onMouseEnter={() => setHoveredChip(idx)}
            onMouseLeave={() => setHoveredChip(null)}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                background: hoveredChip === idx ? `${color}22` : 'rgba(34,211,238,0.1)',
              }}
            >
              <Icon size={16} style={{ color: hoveredChip === idx ? color : '#22d3ee', transition: 'color 0.3s' }} />
            </div>
            <div>
              <p className="text-white font-medium leading-tight">{label}</p>
              <p
                className="text-xs mt-0.5 transition-all duration-300 overflow-hidden"
                style={{
                  color: hoveredChip === idx ? '#94a3b8' : '#64748b',
                  maxHeight: hoveredChip === idx ? '40px' : '16px',
                }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
