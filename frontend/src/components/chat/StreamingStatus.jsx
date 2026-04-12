import { Bot, Cpu, GitBranch, Sparkles } from 'lucide-react';

const PHASE_CONFIG = {
  routing: {
    icon: GitBranch,
    label: 'Routing to specialists',
    color: 'text-blue-400',
  },
  agent_finding: {
    icon: Cpu,
    label: 'Agents analyzing',
    color: 'text-violet-400',
  },
  synthesizing: {
    icon: Sparkles,
    label: 'Synthesizing insights',
    color: 'text-cyan-400',
  },
};

const AGENT_DISPLAY = {
  analyst_agent: 'Data Analyst',
  investor_agent: 'Investment Analyst',
  geo_politics_agent: 'Geopolitical Analyst',
};

export function StreamingStatus({ status }) {
  if (!status) return null;
  const cfg = PHASE_CONFIG[status.phase] || PHASE_CONFIG.routing;
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #06b6d420, #8b5cf620)', border: '1px solid rgba(34,211,238,0.2)' }}>
        <Bot size={14} className="text-cyan-400" />
      </div>
      <div className="flex-1">
        <div className="ai-bubble rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Icon size={14} className={`${cfg.color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-400">{cfg.label}</p>
              {/* Active agents */}
              {status.agents?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {status.agents.map(agent => (
                    <span
                      key={agent}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                        status.currentAgent === agent
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                      }`}
                    >
                      {AGENT_DISPLAY[agent] || agent}
                      {status.currentAgent === agent && (
                        <span className="ml-1.5 inline-flex gap-0.5">
                          <span className="typing-dot" style={{ width: 4, height: 4, animationDelay: '-0.32s' }} />
                          <span className="typing-dot" style={{ width: 4, height: 4, animationDelay: '-0.16s' }} />
                          <span className="typing-dot" style={{ width: 4, height: 4 }} />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Bounce dots */}
            <div className="flex gap-1 flex-shrink-0">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
