import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppStore } from './store/appStore';
import { HomePage } from './components/home/HomePage';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';

function AppRouter() {
  const { screen } = useAppStore();
  if (screen === 'workspace') return <WorkspaceLayout />;
  return <HomePage />;
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
            background: '#1a3c2e',
            color: '#f5f2ed',
            border: '1px solid rgba(223,238,230,0.2)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#1a3c2e' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1a3c2e' }, duration: 6000 },
          loading: { iconTheme: { primary: '#dfeee6', secondary: '#1a3c2e' } },
        }}
      />
    </AppProvider>
  );
}
