const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Opens a SSE connection to the chat endpoint.
 * Calls callbacks for each SSE event type.
 *
 * @param {string} query - User's natural language query
 * @param {string} datasetId - The active dataset ID
 * @param {Object} callbacks - { onRouting, onAgentFinding, onSynthesizing, onResult, onError, onDone }
 * @returns {AbortController} - call .abort() to cancel
 */
export function streamChat(query, datasetId, callbacks) {
  const controller = new AbortController();

  const run = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dataset_id: datasetId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch {}
        const error = new Error(errData.message || 'Chat request failed');
        error.code = errData.code || 'CHAT_ERROR';
        error.status = res.status;
        callbacks.onError?.(error);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      // These MUST be outside the while loop to persist across TCP chunk boundaries
      let currentEvent = null;
      let currentData = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete chunk

        for (let line of lines) {
          line = line.replace(/\r$/, ''); // Clean carriage returns from sse-starlette \r\n streams
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            // Append data instead of overwrite, to handle multiline SSE data payloads properly
            const slice = line.slice(6);
            currentData = currentData ? currentData + '\n' + slice : slice;
          } else if (line === '' && currentEvent && currentData) {
            // Dispatch the event
            try {
              const payload = JSON.parse(currentData);
              switch (currentEvent) {
                case 'routing':
                  callbacks.onRouting?.(payload);
                  break;
                case 'agent_finding':
                  callbacks.onAgentFinding?.(payload);
                  break;
                case 'synthesizing':
                  callbacks.onSynthesizing?.(payload);
                  break;
                case 'result':
                  callbacks.onResult?.(payload);
                  break;
                case 'error':
                  callbacks.onError?.(payload);
                  break;
                default:
                  break;
              }
            } catch (e) {
              console.warn('SSE parse error:', e, currentData);
            }
            currentEvent = null;
            currentData = '';
          }
        }
      }

      callbacks.onDone?.();
    } catch (err) {
      if (err.name === 'AbortError') return; // intentional cancel
      callbacks.onError?.({ message: err.message || 'Network error', code: 'NETWORK_ERROR' });
    }
  };

  run();
  return controller;
}
