import { useRef, useCallback, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

export function InputCard() {
  const fileInputRef = useRef(null);
  const { isUploading, handleUpload } = useUpload();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    []
  );

  const openFilePicker = useCallback(() => {
    if (isUploading) return;
    fileInputRef.current?.click();
  }, [isUploading]);

  const handleStartChat = useCallback(() => {
    if (!selectedFile || isUploading) return;
    handleUpload(selectedFile);
  }, [selectedFile, isUploading, handleUpload]);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canStart = !!selectedFile && !isUploading;

  return (
    <div className="bg-white rounded-[22px] p-7 pb-8 shadow-[0_2px_24px_rgba(0,0,0,0.05)] border border-[#e8e3dd] max-w-[520px] flex flex-col min-h-[320px]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelect}
        id="csv-file-input"
        disabled={isUploading}
      />

      {/* Input field */}
      <div
        className="bg-[#f5f2ed] rounded-[14px] px-4 py-3.5 mb-5 cursor-pointer hover:bg-[#f0ede7] transition-colors"
        onClick={openFilePicker}
      >
        <p className="text-[13px] text-[#a8a29e] font-sans">
          Upload a CSV file
        </p>
      </div>

      {/* Selected file indicator */}
      {selectedFile && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dfeee6] border border-[#1a3c2e]/20">
            <Paperclip size={12} className="text-[#1a3c2e]" />
            <span className="text-[12px] text-[#1a3c2e] font-medium truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <span className="text-[11px] text-[#1a3c2e]/60">
              {formatSize(selectedFile.size)}
            </span>
          </div>
        </div>
      )}

      {/* Example */}
      <p className="text-[12px] text-[#8a8580] mb-8 leading-relaxed">
        Example: If a product raises its price next quarter, how will customer
        sentiment and narrative spread change?
      </p>

      {/* Buttons row */}
      <div className="flex items-center gap-3 mt-auto">
        <button
          onClick={handleStartChat}
          disabled={!canStart}
          className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
            canStart
              ? 'bg-[#1a3c2e] text-white hover:bg-[#142e23] shadow-sm'
              : 'bg-[#c2c2c2] text-white cursor-not-allowed'
          }`}
          id="start-chat-btn"
        >
          {isUploading ? 'Uploading…' : 'Start Chat'}{' '}
          {!isUploading && <span className="text-[11px]">→</span>}
        </button>

        <button
          onClick={openFilePicker}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-[13px] text-[#5a5a5a] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
          id="upload-csv-btn"
        >
          <Paperclip size={13} />
          Upload CSV
        </button>
      </div>
    </div>
  );
}
