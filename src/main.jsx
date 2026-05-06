import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import * as Sentry from '@sentry/react';
import packageJson from '../package.json';
import './index.css';
import 'katex/dist/katex.min.css';
import App from './App.jsx';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: `quiz-forge@${packageJson.version}`,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Performance Monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1,

  // Session Replay
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1,
  replaysOnErrorSampleRate: 1,
});

registerSW({ immediate: true });
createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn('Uncaught error', error, errorInfo.componentStack);
  }),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>
);
