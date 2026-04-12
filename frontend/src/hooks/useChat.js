import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { streamChat } from '../api/chat';
import { useAppStore } from '../store/appStore';

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState(null); // { phase, agents, currentAgent }
  const abortRef = useRef(null);
  const { dataset, addMessage, updateLastMessage } = useAppStore();

  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || isStreaming || !dataset?.id) return;

    // Cancel any prior stream
    abortRef.current?.abort();

    // Add user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    // Add placeholder AI message
    const aiMsg = {
      id: crypto.randomUUID(),
      role: 'ai',
      content: '',
      viz: null,
      newsSeverity: null,
      isStreaming: true,
      timestamp: new Date().toISOString(),
    };
    addMessage(aiMsg);

    setIsStreaming(true);
    setStreamingStatus({ phase: 'routing', agents: [], currentAgent: null });

    abortRef.current = streamChat(query, dataset.id, {
      onRouting: (payload) => {
        setStreamingStatus({
          phase: 'routing',
          agents: payload.active_agents || [],
          currentAgent: null,
          queryType: payload.query_type,
        });
      },
      onAgentFinding: (payload) => {
        setStreamingStatus(prev => ({
          ...prev,
          phase: 'agent_finding',
          currentAgent: payload.agent_name,
        }));
      },
      onSynthesizing: () => {
        setStreamingStatus(prev => ({ ...prev, phase: 'synthesizing', currentAgent: null }));
      },
      onResult: (payload) => {
        updateLastMessage({
          content: payload.text || '',
          viz: payload.viz || null,
          newsSeverity: payload.news_severity || 'LOW',
          isStreaming: false,
        });
      },
      onError: (errPayload) => {
        const message = errPayload.message || 'Something went wrong with the AI engine.';
        updateLastMessage({
          content: '',
          error: message,
          isStreaming: false,
        });
        toast.error(message, { duration: 5000 });
        setIsStreaming(false);
        setStreamingStatus(null);
      },
      onDone: () => {
        setIsStreaming(false);
        setStreamingStatus(null);
        // Ensure streaming flag cleared on AI message
        updateLastMessage(prev => {
          if (prev.isStreaming) return { ...prev, isStreaming: false };
          return prev;
        });
      },
    });
  }, [isStreaming, dataset, addMessage, updateLastMessage]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingStatus(null);
    updateLastMessage(prev => ({ ...prev, isStreaming: false, content: prev.content || '*(Generation cancelled)*' }));
  }, [updateLastMessage]);

  return { sendMessage, isStreaming, streamingStatus, cancelStream };
}
