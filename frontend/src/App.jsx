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
            background: '#ffffff',
            color: '#1a1a1a',
            border: '1px solid #e5e0da',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' }, duration: 6000 },
          loading: { iconTheme: { primary: '#22d3ee', secondary: '#ffffff' } },
        }}
      />
    </AppProvider>
  );
}
