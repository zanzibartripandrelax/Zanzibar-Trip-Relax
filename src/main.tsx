import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { UserPreferencesProvider } from './context/UserPreferencesContext.tsx';
import { AnalyticsProvider } from './context/AnalyticsContext.tsx';
import { initializeNotificationService } from './services/notificationService';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Initialize the event-driven notification service subscribers
initializeNotificationService();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <UserPreferencesProvider>
          <AnalyticsProvider>
            <App />
          </AnalyticsProvider>
        </UserPreferencesProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
