import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, type FutureConfig } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './hooks/useApi';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

const future: FutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={future}>
        <AuthProvider>
          <QueryProvider>
            <App />
          </QueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);