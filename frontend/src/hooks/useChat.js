import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { streamChat } from '../api/chat';
import { useAppStore } from '../store/appStore';

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState(null);
  const abortRef = useRef(null);
  const { activeDataset, addMessage, updateLastMessage, addCenterItem } = useAppStore();

  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || isStreaming || !activeDataset?.id) return;
    abortRef.current?.abort();

    addMessage({ id: crypto.randomUUID(), role: 'user', content: query, timestamp: new Date().toISOString() });
    addMessage({ id: crypto.randomUUID(), role: 'ai', content: '', newsSeverity: null, agent: null, isStreaming: true, timestamp: new Date().toISOString() });

    setIsStreaming(true);
    setStreamingStatus({ phase: 'routing', agents: [], currentAgent: null });

    abortRef.current = streamChat(query, activeDataset.id, {
      onRouting: (p) => setStreamingStatus({ phase: 'routing', agents: p.active_agents || [], currentAgent: null, queryType: p.query_type }),
      onAgentFinding: (p) => setStreamingStatus(s => ({ ...s, phase: 'agent_finding', currentAgent: p.agent_name })),
      onSynthesizing: () => setStreamingStatus(s => ({ ...s, phase: 'synthesizing', currentAgent: null })),
      onResult: (p) => {
        // Text → right panel (messages)
        updateLastMessage({ content: p.text || '', newsSeverity: p.news_severity || 'LOW', isStreaming: false });
        // Viz → center panel
        if (p.viz) addCenterItem({ type: 'viz', content: p.viz, title: p.viz.title || 'Visualization' });
      },
      onError: (e) => {
        const msg = e.message || 'Something went wrong.';
        updateLastMessage({ content: '', error: msg, isStreaming: false });
        toast.error(msg, { duration: 5000 });
        setIsStreaming(false);
        setStreamingStatus(null);
      },
      onDone: () => {
        setIsStreaming(false);
        setStreamingStatus(null);
        updateLastMessage(prev => prev.isStreaming ? { ...prev, isStreaming: false } : prev);
      },
    });
  }, [isStreaming, activeDataset, addMessage, updateLastMessage, addCenterItem]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingStatus(null);
    updateLastMessage(prev => ({ ...prev, isStreaming: false, content: prev.content || '*(Cancelled)*' }));
  }, [updateLastMessage]);

  return { sendMessage, isStreaming, streamingStatus, cancelStream };
}
