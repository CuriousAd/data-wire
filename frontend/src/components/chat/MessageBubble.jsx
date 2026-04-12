import { useState, useCallback } from 'react';
import { Bot, User, AlertTriangle, Clock, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartRenderer } from '../viz/ChartRenderer';

const SEVERITY_CONFIG = {
  LOW:      { label: 'Low Risk',    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  MEDIUM:   { label: 'Medium Risk', className: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
  HIGH:     { label: 'High Risk',   className: 'bg-red-500/10    text-red-400    border-red-500/20'    },
  CRITICAL: { label: 'Critical',    className: 'bg-red-600/20    text-red-300    border-red-500/30'    },
};

const AGENT_STYLES = {
  analyst_agent:      { label: '📊 Analyst',      color: '#22d3ee', glow: 'rgba(34,211,238,0.25)' },
  investor_agent:     { label: '💹 Investor',      color: '#fbbf24', glow: 'rgba(251,191,36,0.25)'  },
  geo_politics_agent: { label: '🌍 Geo-Politics',  color: '#a78bfa', glow: 'rgba(167,139,250,0.25)' },
};

function TimeStamp({ iso }) {
  const d = new Date(iso);
  return (
    <span className="text-xs text-slate-600 flex items-center gap-1">
      <Clock size={10} />
      {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

function UserMessage({ message }) {
  return (
    <div className="flex justify-end gap-3" id={`msg-${message.id}`} style={{ animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
      <div className="max-w-[75%] space-y-1">
        <div className="user-bubble rounded-2xl rounded-tr-sm px-4 py-3 transition-all duration-150 hover:border-violet-500/40">
          <p className="text-slate-200 text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="flex justify-end">
          <TimeStamp iso={message.timestamp} />
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 hover:bg-violet-600/40 hover:border-violet-400/50">
        <User size={14} className="text-violet-300" />
      </div>
    </div>
  );
}

function AIMessage({ message }) {
  const severity = message.newsSeverity ? SEVERITY_CONFIG[message.newsSeverity] : null;
  const [copied,   setCopied]   = useState(false);
  const [reaction, setReaction] = useState(null); // 'up' | 'down' | null
  const [hovered,  setHovered]  = useState(false);

  const handleCopy = useCallback(() => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const handleReaction = (dir) => {
    setReaction(prev => prev === dir ? null : dir);
  };

  // Extract agent label from message metadata if available
  const agentKey  = message.agent;
  const agentCfg  = agentKey ? AGENT_STYLES[agentKey] : null;

  return (
    <div
      className="flex gap-3"
      id={`msg-${message.id}`}
      style={{ animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #06b6d420, #8b5cf620)',
          border: hovered ? '1px solid rgba(34,211,238,0.4)' : '1px solid rgba(34,211,238,0.2)',
          boxShadow: hovered ? '0 0 10px rgba(34,211,238,0.2)' : 'none',
        }}
      >
        <Bot size={14} className="text-cyan-400" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Optional agent badge */}
        {agentCfg && (
          <div
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mb-1"
            style={{
              color: agentCfg.color,
              borderColor: `${agentCfg.color}33`,
              background: `${agentCfg.color}12`,
              boxShadow: hovered ? `0 0 8px ${agentCfg.glow}` : 'none',
              transition: 'box-shadow 0.3s',
            }}
          >
            {agentCfg.label}
          </div>
        )}

        {/* Main bubble */}
        <div
          className="ai-bubble rounded-2xl rounded-tl-sm px-4 py-4 transition-all duration-200"
          style={{ borderColor: hovered ? 'rgba(34,211,238,0.18)' : undefined }}
        >
          {/* Error state */}
          {message.error && (
            <div className="flex items-start gap-2 text-red-400">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{message.error}</p>
            </div>
          )}

          {/* Streaming skeleton */}
          {message.isStreaming && !message.content && (
            <div className="space-y-2">
              <div className="shimmer-bg h-3.5 rounded-full w-3/4" />
              <div className="shimmer-bg h-3.5 rounded-full w-1/2" />
              <div className="shimmer-bg h-3.5 rounded-full w-5/6" />
            </div>
          )}

          {/* Markdown content */}
          {message.content && (
            <div className="prose prose-sm prose-invert max-w-none text-slate-300
              prose-headings:text-white prose-headings:font-semibold
              prose-strong:text-white prose-strong:font-semibold
              prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:rounded prose-code:px-1
              prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-slate-700/50
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-cyan-500/30 prose-blockquote:text-slate-400
              prose-li:text-slate-300 prose-p:leading-relaxed
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Severity badge */}
          {severity && message.newsSeverity !== 'LOW' && (
            <div className={`mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${severity.className}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {severity.label} — News Context
            </div>
          )}

          {/* Chart */}
          {message.viz && <ChartRenderer vizConfig={message.viz} />}
        </div>

        {/* Action bar — copy + reactions — fade in on hover */}
        {!message.isStreaming && (message.content || message.viz) && (
          <div
            className="flex items-center gap-1 pt-0.5 transition-all duration-200"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(4px)' }}
          >
            <TimeStamp iso={message.timestamp} />
            <div className="ml-auto flex items-center gap-1">
              {/* Copy button */}
              {message.content && (
                <button
                  onClick={handleCopy}
                  className={`bubble-action-btn ${copied ? 'active-copy' : ''}`}
                  title={copied ? 'Copied!' : 'Copy response'}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              )}
              {/* Thumbs up */}
              <button
                onClick={() => handleReaction('up')}
                className={`bubble-action-btn ${reaction === 'up' ? 'active-positive' : ''}`}
                title="Good response"
              >
                <ThumbsUp size={13} />
              </button>
              {/* Thumbs down */}
              <button
                onClick={() => handleReaction('down')}
                className={`bubble-action-btn ${reaction === 'down' ? 'active-negative' : ''}`}
                title="Bad response"
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Timestamp when not hovered (non-streaming, no action bar) */}
        {(message.isStreaming || (!message.content && !message.viz)) && (
          <TimeStamp iso={message.timestamp} />
        )}
      </div>
    </div>
  );
}

export function MessageBubble({ message }) {
  if (message.role === 'user') return <UserMessage message={message} />;
  return <AIMessage message={message} />;
}
