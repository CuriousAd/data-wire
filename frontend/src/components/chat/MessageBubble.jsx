import { Bot, User, AlertTriangle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartRenderer } from '../viz/ChartRenderer';

const SEVERITY_CONFIG = {
  LOW: { label: 'Low Risk', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  MEDIUM: { label: 'Medium Risk', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  HIGH: { label: 'High Risk', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  CRITICAL: { label: 'Critical', className: 'bg-red-600/20 text-red-300 border-red-500/30' },
};

const AGENT_LABELS = {
  analyst_agent: '📊 Analyst',
  investor_agent: '💹 Investor',
  geo_politics_agent: '🌍 Geo-Politics',
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
    <div className="flex justify-end gap-3 animate-slide-up" id={`msg-${message.id}`}>
      <div className="max-w-[75%] space-y-1">
        <div className="user-bubble rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-slate-200 text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="flex justify-end">
          <TimeStamp iso={message.timestamp} />
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <User size={14} className="text-violet-300" />
      </div>
    </div>
  );
}

function AIMessage({ message }) {
  const severity = message.newsSeverity ? SEVERITY_CONFIG[message.newsSeverity] : null;

  return (
    <div className="flex gap-3 animate-slide-up" id={`msg-${message.id}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'linear-gradient(135deg, #06b6d420, #8b5cf620)', border: '1px solid rgba(34,211,238,0.2)' }}>
        <Bot size={14} className="text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        {/* Bubble */}
        <div className="ai-bubble rounded-2xl rounded-tl-sm px-4 py-4">
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

        <TimeStamp iso={message.timestamp} />
      </div>
    </div>
  );
}

export function MessageBubble({ message }) {
  if (message.role === 'user') return <UserMessage message={message} />;
  return <AIMessage message={message} />;
}
