import { useEffect, useRef, useCallback, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { StreamingStatus } from './StreamingStatus';
import { ChatInput } from './ChatInput';
import { useAppStore } from '../../store/appStore';
import { useChat } from '../../hooks/useChat';
import { Zap, Trash2, FileText, RowsIcon, Columns } from 'lucide-react';

/** Popover showing dataset stats */
function DatasetPopover({ dataset }) {
  return (
    <div
      className="absolute top-full right-0 mt-2 z-20 glass-strong rounded-xl p-3 min-w-[200px] border border-cyan-500/20 shadow-2xl"
      style={{ animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-semibold">Dataset Info</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <FileText size={11} className="text-cyan-400" />
          <span className="text-slate-400 truncate max-w-[140px]">{dataset.filename}</span>
        </div>
        {dataset.rowCount && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Rows</span>
            <span className="ml-auto text-slate-300 font-mono font-medium">{dataset.rowCount.toLocaleString()}</span>
          </div>
        )}
        {dataset.columnCount && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Columns</span>
            <span className="ml-auto text-slate-300 font-mono font-medium">{dataset.columnCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DatasetChip({ dataset }) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div
      className="relative flex items-center gap-3 px-3 py-2 glass rounded-xl text-xs cursor-pointer transition-all duration-200 hover:border-cyan-500/30"
      style={{ border: showPopover ? '1px solid rgba(34,211,238,0.3)' : undefined }}
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <FileText size={12} className="text-cyan-400 flex-shrink-0" />
      <span className="text-slate-300 font-medium truncate max-w-[140px]">{dataset.filename}</span>
      {dataset.rowCount && (
        <span className="text-slate-500">{dataset.rowCount?.toLocaleString()} rows</span>
      )}
      {dataset.columnCount && (
        <span className="text-slate-500">{dataset.columnCount} cols</span>
      )}

      {showPopover && <DatasetPopover dataset={dataset} />}
    </div>
  );
}

function EmptyState({ onSendExample }) {
  const examples = [
    { emoji: '📈', text: 'Show me top performing categories' },
    { emoji: '🌍', text: 'Map the geographic distribution' },
    { emoji: '⚠️', text: 'Find anomalies or outliers' },
    { emoji: '📊', text: 'Give me a full summary of this dataset' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(167,139,250,0.1))',
          border: '1px solid rgba(34,211,238,0.1)',
          animation: 'floatBadge 3s ease-in-out infinite',
        }}
      >
        <Zap size={28} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.5))' }} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Dataset ready!</h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Ask anything about your data. You'll get an AI-powered analysis with a matching visualization.
      </p>

      {/* Clickable suggestion examples */}
      <div className="mt-6 space-y-2 text-left w-full max-w-xs">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => onSendExample(ex.text)}
            className="w-full text-left text-xs text-slate-400 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group"
            style={{
              background: 'rgba(15,23,40,0.5)',
              border: '1px solid rgba(255,255,255,0.05)',
              animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(34,211,238,0.25)';
              e.currentTarget.style.background = 'rgba(34,211,238,0.04)';
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.color = '#94a3b8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.background = 'rgba(15,23,40,0.5)';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.color = '';
            }}
          >
            <span className="mr-2">{ex.emoji}</span>
            "{ex.text}"
            <span
              className="ml-2 text-cyan-500/0 group-hover:text-cyan-500/60 transition-colors text-xs"
              style={{ fontSize: 10 }}
            >
              ↵ send
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatContainer() {
  const { messages, dataset, resetToUpload } = useAppStore();
  const { isStreaming, streamingStatus, sendMessage } = useChat();
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingStatus]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendExample = useCallback((text) => {
    if (isStreaming) return;
    sendMessage(text);
    scrollToBottom();
  }, [isStreaming, sendMessage, scrollToBottom]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-navy-950">

      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 glass-strong border-b border-slate-800/50">
        <div className="flex items-center gap-2 mr-auto">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 12px rgba(34,211,238,0.2)' }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm logo-underline">Data-Wire</span>
          <span className="text-slate-600 text-xs hidden sm:block">/ AI Chat</span>
        </div>

        {dataset && <DatasetChip dataset={dataset} />}

        <button
          onClick={resetToUpload}
          id="upload-new-dataset-btn"
          title="Upload a new dataset"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 ml-2 border border-transparent hover:border-red-500/20"
        >
          <Trash2 size={12} />
          <span className="hidden sm:block">New dataset</span>
        </button>
      </header>

      {/* Messages scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin"
        id="chat-messages-container"
      >
        {messages.length === 0 ? (
          <EmptyState onSendExample={handleSendExample} />
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {isStreaming && streamingStatus && (
          <StreamingStatus status={streamingStatus} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chat input */}
      <ChatInput onQuerySent={scrollToBottom} />
    </div>
  );
}
