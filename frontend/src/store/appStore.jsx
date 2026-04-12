import { createContext, useContext, useState, useCallback } from 'react';

// App-level state shape:
// screen: 'upload' | 'processing' | 'chat'
// dataset: { id, filename, rowCount, columnCount, profile } | null
// messages: array of chat message objects

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('upload');
  const [dataset, setDataset] = useState(null);
  const [messages, setMessages] = useState([]);

  const goToProcessing = useCallback((datasetId, filename) => {
    setDataset({ id: datasetId, filename, rowCount: null, columnCount: null, profile: null });
    setScreen('processing');
  }, []);

  const goToChat = useCallback((datasetInfo) => {
    setDataset(prev => ({ ...prev, ...datasetInfo }));
    setScreen('chat');
  }, []);

  const resetToUpload = useCallback(() => {
    setScreen('upload');
    setDataset(null);
    setMessages([]);
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const updateLastMessage = useCallback((updater) => {
    setMessages(prev => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last) next[next.length - 1] = typeof updater === 'function' ? updater(last) : { ...last, ...updater };
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      screen, dataset, messages,
      goToProcessing, goToChat, resetToUpload,
      addMessage, updateLastMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
