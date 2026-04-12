import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppStore } from './store/appStore';
import { UploadZone } from './components/upload/UploadZone';
import { ProcessingScreen } from './components/upload/ProcessingScreen';
import { ChatContainer } from './components/chat/ChatContainer';

function AppRouter() {
  const { screen } = useAppStore();

  if (screen === 'upload') return <UploadZone />;
  if (screen === 'processing') return <ProcessingScreen />;
  if (screen === 'chat') return <ChatContainer />;
  return <UploadZone />;
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f1728',
            color: '#e2e8f0',
            border: '1px solid rgba(34, 211, 238, 0.15)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#0f1728',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0f1728',
            },
            duration: 6000,
          },
          loading: {
            iconTheme: {
              primary: '#22d3ee',
              secondary: '#0f1728',
            },
          },
        }}
      />
    </AppProvider>
  );
}
