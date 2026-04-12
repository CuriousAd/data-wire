import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('home'); // 'home' | 'workspace'
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [centerItems, setCenterItems] = useState([]); // [{ id, type:'viz'|'dataset', content, title }]

  const activeDataset = datasets.find(d => d.id === activeDatasetId) || null;

  const goToWorkspace = useCallback((datasetId, filename) => {
    setDatasets(prev => [...prev, { id: datasetId, filename, rowCount: null, columnCount: null, profile: null, status: 'processing' }]);
    setActiveDatasetId(datasetId);
    setMessages([]);
    setCenterItems([]);
    setScreen('workspace');
  }, []);

  const updateDataset = useCallback((datasetId, updates) => {
    setDatasets(prev => prev.map(d => d.id === datasetId ? { ...d, ...updates } : d));
  }, []);

  const switchDataset = useCallback((datasetId) => {
    // TODO: cache current messages to Redis before clearing
    setActiveDatasetId(datasetId);
    setMessages([]);
    setCenterItems([]);
  }, []);

  const addCenterItem = useCallback((item) => {
    setCenterItems(prev => [...prev, { id: crypto.randomUUID(), ...item }]);
  }, []);

  const clearCenter = useCallback(() => { setCenterItems([]); }, []);

  const resetToHome = useCallback(() => {
    setScreen('home');
    setDatasets([]);
    setActiveDatasetId(null);
    setMessages([]);
    setCenterItems([]);
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
      screen, datasets, activeDatasetId, activeDataset, messages, centerItems,
      goToWorkspace, updateDataset, switchDataset, setActiveDatasetId,
      addCenterItem, clearCenter, resetToHome,
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
