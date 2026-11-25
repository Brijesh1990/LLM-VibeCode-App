import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './routes/ErrorBoundary';
import './styles/index.css';

function RootApp() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    AOS.init({
      duration: 500,
      easing: 'ease-out-cubic',
      once: true,
      offset: 30,
      disable: prefersReducedMotion,
    });
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '14px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
