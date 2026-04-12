import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const EXAMPLE_QUERIES = [
  'What are the top 5 trends in this dataset?',
  'Show me the distribution of values by category',
  'Are there any anomalies or outliers?',
  'What is the overall performance summary?',
  'Show me a time-series trend analysis',
];

const CHAR_SOFT_LIMIT = 2000;

export function ChatInput({ onQuerySent }) {
  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
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
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  /** Click on a suggestion chip → instantly fires the message */
  const handleChipSend = (q) => {
    if (isStreaming) return;
    sendMessage(q);
    onQuerySent?.();
  };

  const charsLeft  = CHAR_SOFT_LIMIT - query.length;
  const isOverLimit = charsLeft < 0;
  const nearLimit   = charsLeft < 200;
  const canSend     = query.trim().length > 0 && !isStreaming && !isOverLimit;

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-2">

      {/* Suggestion chips — only show when empty and not streaming */}
      {!query && !isStreaming && (
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
          {EXAMPLE_QUERIES.slice(0, 4).map((q, i) => (
            <button
              key={i}
              onClick={() => handleChipSend(q)}
              className="suggestion-chip"
              style={{ animationDelay: `${i * 0.05}s`, animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
              title="Click to send instantly"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <div
        className="glass-strong rounded-2xl flex items-end gap-3 p-3 transition-all duration-300"
        style={{
          border: focused
            ? 'none'
            : query
            ? '1px solid rgba(34,211,238,0.2)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: focused ? '0 0 0 1.5px rgba(34,211,238,0.35), 0 0 20px rgba(34,211,238,0.1)' : 'none',
        }}
      >
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            id="chat-query-input"
            className="chat-input"
            placeholder="Ask anything about your data…"
            value={query}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            disabled={isStreaming}
            style={{ maxHeight: 160 }}
          />
        </div>

        {/* Char counter — appears when near limit */}
        {query.length > 0 && (
          <span
            className="text-xs flex-shrink-0 tabular-nums transition-all duration-200 mb-1"
            style={{
              color: isOverLimit ? '#f87171' : nearLimit ? '#fbbf24' : '#475569',
              animation: nearLimit ? 'fadeIn 0.2s ease' : 'none',
            }}
          >
            {isOverLimit ? `+${Math.abs(charsLeft)}` : charsLeft}
          </span>
        )}

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
            disabled={!canSend}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${canSend ? 'send-btn-ready' : ''}`}
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #06b6d4, #8b5cf6)'
                : 'rgba(255,255,255,0.04)',
              border: canSend ? 'none' : '1px solid rgba(255,255,255,0.08)',
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
            title="Send (Enter)"
          >
            <Send size={14} className={canSend ? 'text-white' : 'text-slate-600'} />
          </button>
        )}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-slate-700 mt-2">
        Enter to send · Shift+Enter for new line
        {!isStreaming && query.length === 0 && (
          <span className="ml-2 text-slate-800">· Click a chip above to send instantly</span>
        )}
      </p>
    </div>
  );
}
