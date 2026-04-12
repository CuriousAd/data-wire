import { useState, useRef, useCallback } from 'react';
import { Send, Square, Lightbulb } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const EXAMPLE_QUERIES = [
  'What are the top 5 trends in this dataset?',
  'Show me the distribution of values by category',
  'Are there any anomalies or outliers?',
  'What is the overall performance summary?',
  'Show me a time-series trend analysis',
];

export function ChatInput({ onQuerySent }) {
  const [query, setQuery] = useState('');
  const { sendMessage, isStreaming, cancelStream } = useChat();
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!query.trim() || isStreaming) return;
    const q = query.trim();
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendMessage(q);
    onQuerySent?.();
  }, [query, isStreaming, sendMessage, onQuerySent]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setQuery(e.target.value);
    // Auto-resize textarea
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleExample = (q) => {
    setQuery(q);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-2">
      {/* Example prompts — only show when input is empty */}
      {!query && !isStreaming && (
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
          {EXAMPLE_QUERIES.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => handleExample(q)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-cyan-500/30 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <div
        className="glass-strong rounded-2xl flex items-end gap-3 p-3 transition-all duration-200"
        style={{ border: query ? '1px solid rgba(34,211,238,0.2)' : '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            id="chat-query-input"
            className="chat-input"
            placeholder="Ask anything about your data..."
            value={query}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
            style={{ maxHeight: 160 }}
          />
        </div>

        {isStreaming ? (
          <button
            onClick={cancelStream}
            id="cancel-stream-btn"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex-shrink-0"
            title="Cancel generation"
          >
            <Square size={14} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            id="send-chat-btn"
            disabled={!query.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: query.trim() ? 'linear-gradient(135deg, #06b6d4, #8b5cf6)' : 'rgba(255,255,255,0.04)',
              border: query.trim() ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: query.trim() ? '0 0 16px rgba(34,211,238,0.25)' : 'none',
              cursor: query.trim() ? 'pointer' : 'not-allowed',
            }}
            title="Send (Enter)"
          >
            <Send size={14} className={query.trim() ? 'text-white' : 'text-slate-600'} />
          </button>
        )}
      </div>
      <p className="text-center text-xs text-slate-700 mt-2">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
