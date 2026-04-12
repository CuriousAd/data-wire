import { useEffect, useRef, useCallback, useState } from 'react';
import { Bot, User, Clock, Copy, Check, AlertTriangle, Send, Square, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../store/appStore';
import { useChat } from '../../hooks/useChat';

function TimeStamp({ iso }) {
  const d = new Date(iso);
  return <span className="text-[9px] text-[#a8a29e] flex items-center gap-1"><Clock size={8} />{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
}

function UserMsg({ msg }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="max-w-[88%]">
        <div className="bg-[#1a3c2e] text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5">
          <p className="text-[12.5px] leading-relaxed">{msg.content}</p>
        </div>
        <div className="flex justify-end mt-0.5"><TimeStamp iso={msg.timestamp} /></div>
      </div>
    </div>
  );
}

function AIMsg({ msg }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => { if (!msg.content) return; navigator.clipboard.writeText(msg.content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#dfeee6] border border-[#1a3c2e]/10">
        <Bot size={11} className="text-[#1a3c2e]" />
      </div>
      <div className="flex-1 min-w-0">
        {msg.error && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 border border-red-100 text-[12px]">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" /><p>{msg.error}</p>
          </div>
        )}
        {msg.isStreaming && !msg.content && (
          <div className="space-y-2 bg-white rounded-2xl rounded-tl-sm px-3.5 py-3 border border-[#e5e0da]">
            <div className="h-2.5 rounded-full w-3/4 bg-[#ece8e2] animate-pulse" />
            <div className="h-2.5 rounded-full w-1/2 bg-[#ece8e2] animate-pulse" />
            <div className="h-2.5 rounded-full w-5/6 bg-[#ece8e2] animate-pulse" />
          </div>
        )}
        {msg.content && (
          <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-3 border border-[#e5e0da]">
            <div className="prose prose-sm max-w-none text-[#2d2d2d] text-[12.5px]
              prose-headings:text-[#1a1a1a] prose-headings:font-semibold prose-headings:text-[13px]
              prose-strong:text-[#1a1a1a] prose-code:text-[#1a3c2e] prose-code:bg-[#dfeee6] prose-code:rounded prose-code:px-1 prose-code:text-[11px]
              prose-pre:bg-[#f5f2ed] prose-pre:border prose-pre:border-[#e5e0da] prose-pre:text-[11px]
              prose-a:text-[#1a3c2e] prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-[#1a3c2e]/20 prose-blockquote:text-[#6b6b6b]
              prose-li:text-[#2d2d2d] prose-p:leading-relaxed prose-p:my-1.5
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#f0ebe4]">
              <TimeStamp iso={msg.timestamp} />
              <button onClick={doCopy} className="ml-auto text-[#b5b0aa] hover:text-[#1a3c2e] transition-colors p-0.5 rounded" title={copied ? 'Copied!' : 'Copy'}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StreamingDots({ status }) {
  if (!status) return null;
  const labels = { routing: 'Routing to specialists…', agent_finding: `Analyzing…`, synthesizing: 'Synthesizing insights…' };
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#dfeee6] border border-[#1a3c2e]/10">
        <Loader2 size={11} className="text-[#1a3c2e] animate-spin" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 border border-[#e5e0da]">
        <p className="text-[11px] text-[#8a8580]">{labels[status.phase] || 'Processing…'}</p>
      </div>
    </div>
  );
}

export function RightPanel() {
  const { messages, activeDataset } = useAppStore();
  const { isStreaming, streamingStatus, sendMessage, cancelStream } = useChat();
  const bottomRef = useRef(null);
  const taRef = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingStatus]);

  const send = useCallback(() => {
    if (!query.trim() || isStreaming) return;
    sendMessage(query.trim());
    setQuery('');
    if (taRef.current) taRef.current.style.height = 'auto';
  }, [query, isStreaming, sendMessage]);

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const onChange = (e) => { setQuery(e.target.value); const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; };

  const ready = activeDataset?.status === 'ready';
  const canSend = query.trim().length > 0 && !isStreaming && ready;

  return (
    <div className="h-full flex flex-col bg-[#f0ebe4] border-l border-[#e5e0da]">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#e5e0da] flex items-center gap-2 flex-shrink-0">
        <MessageSquare size={13} className="text-[#1a3c2e]" />
        <span className="text-[11px] font-semibold text-[#1a1a1a]">Chat</span>
        {activeDataset && <span className="text-[10px] text-[#a8a29e] ml-auto truncate max-w-[120px]">{activeDataset.filename}</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {ready
              ? <p className="text-[12px] text-[#a8a29e]">Ask a question about your dataset</p>
              : <><Loader2 size={16} className="text-[#1a3c2e] animate-spin mb-2" /><p className="text-[12px] text-[#a8a29e]">Processing dataset…</p></>
            }
          </div>
        )}
        {messages.map(m => m.role === 'user' ? <UserMsg key={m.id} msg={m} /> : <AIMsg key={m.id} msg={m} />)}
        {isStreaming && streamingStatus && <StreamingDots status={streamingStatus} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1.5 flex-shrink-0">
        <div className="flex items-end gap-2 bg-white rounded-xl p-2 border border-[#e5e0da] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <textarea
            ref={taRef} value={query} onChange={onChange} onKeyDown={onKey}
            placeholder={ready ? 'Ask about your data…' : 'Waiting for dataset…'}
            disabled={!ready || isStreaming} rows={1}
            className="flex-1 resize-none outline-none text-[12px] text-[#1a1a1a] placeholder-[#b5b0aa] bg-transparent disabled:opacity-40"
            style={{ maxHeight: 120 }}
          />
          {isStreaming ? (
            <button onClick={cancelStream} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 transition-colors flex-shrink-0">
              <Square size={11} />
            </button>
          ) : (
            <button onClick={send} disabled={!canSend} className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${canSend ? 'bg-[#1a3c2e] text-white hover:bg-[#142e23]' : 'bg-[#ece8e2] text-[#b5b0aa] cursor-not-allowed'}`}>
              <Send size={11} />
            </button>
          )}
        </div>
        <p className="text-center text-[9px] text-[#b5b0aa] mt-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
