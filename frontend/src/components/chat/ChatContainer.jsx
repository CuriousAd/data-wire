import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { StreamingStatus } from './StreamingStatus';
import { ChatInput } from './ChatInput';
import { useAppStore } from '../../store/appStore';
import { useChat } from '../../hooks/useChat';
import { Database, RowsIcon, ColumnsIcon, Zap, Trash2, FileText } from 'lucide-react';

function DatasetChip({ dataset }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 glass rounded-xl text-xs">
      <FileText size={12} className="text-cyan-400 flex-shrink-0" />
      <span className="text-slate-300 font-medium truncate max-w-[140px]">{dataset.filename}</span>
      {dataset.rowCount && (
        <span className="text-slate-500">{dataset.rowCount?.toLocaleString()} rows</span>
      )}
      {dataset.columnCount && (
        <span className="text-slate-500">{dataset.columnCount} cols</span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(167,139,250,0.1))', border: '1px solid rgba(34,211,238,0.1)' }}>
        <Zap size={28} className="text-cyan-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Dataset ready!</h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Ask anything about your data. You'll get an AI-powered analysis with a matching visualization.
      </p>
      <div className="mt-6 space-y-2 text-left w-full max-w-xs">
        {[
          '📈 "Show me top performing categories"',
          '🌍 "Map the geographic distribution"',
          '⚠️ "Find anomalies or outliers"',
        ].map((s, i) => (
          <div key={i} className="text-xs text-slate-500 px-3 py-2 rounded-lg bg-slate-800/40">{s}</div>
        ))}
      </div>
    </div>
  );
}

export function ChatContainer() {
  const { messages, dataset, resetToUpload } = useAppStore();
  const { isStreaming, streamingStatus } = useChat();
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingStatus]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-navy-950">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 glass-strong border-b border-slate-800/50">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Data-Wire</span>
          <span className="text-slate-600 text-xs hidden sm:block">/ AI Chat</span>
        </div>

        {dataset && <DatasetChip dataset={dataset} />}

        <button
          onClick={resetToUpload}
          id="upload-new-dataset-btn"
          title="Upload a new dataset"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50 ml-2"
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
          <EmptyState />
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {/* Live streaming indicator */}
        {isStreaming && streamingStatus && (
          <StreamingStatus status={streamingStatus} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chat input (sticky bottom) */}
      <ChatInput onQuerySent={scrollToBottom} />
    </div>
  );
}
