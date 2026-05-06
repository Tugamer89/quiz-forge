import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Smartphone } from 'lucide-react';
import * as Sentry from '@sentry/react';

export function useAppUI() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('quiz_theme_dark', false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [hasPromptedPWA, setHasPromptedPWA] = useLocalStorage('quiz_pwa_prompted', false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info',
    id: 0,
    duration: 3000,
  });
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    onConfirm: () => {},
  });

  const toastTimerRef = useRef(null);

  useEffect(() => {
    let localUserId = globalThis.localStorage.getItem('quiz_user_id');
    if (!localUserId) {
      localUserId = crypto.randomUUID();
      globalThis.localStorage.setItem('quiz_user_id', localUserId);
    }

    Sentry.setUser({ id: localUserId });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';

    Sentry.setTag('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    globalThis.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => globalThis.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const showToast = useCallback((msg, type = 'info', customDuration = null) => {
    const id = Date.now();
    const duration = customDuration || (msg.toLowerCase().includes('drive') ? 6000 : 3000);

    setToast({ show: true, message: msg, type, id, duration });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev.id === id ? { ...prev, show: false } : prev));
    }, duration);
  }, []);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const isStandalone =
      globalThis.matchMedia('(display-mode: standalone)').matches ||
      globalThis.navigator.standalone;

    if (!isMobile || isStandalone || hasPromptedPWA) return;

    const timer = setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !globalThis.MSStream;

      if (deferredPrompt || isIOS) {
        setDialog({
          isOpen: true,
          type: 'confirm',
          title: 'Install Quiz Forge',
          icon: <Smartphone className="w-6 h-6 text-indigo-500" />,
          message: isIOS
            ? 'Do you use the app often? Add it to your Home screen for a full-screen experience! Tap the "Share" button at the bottom and select "Add to Home Screen".'
            : "It looks like you're studying hard! Do you want to install the app on your phone for faster access and offline use?",
          confirmLabel: isIOS ? 'Got it' : 'Install',
          confirmStyle: 'primary',
          onConfirm: async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome === 'accepted') {
                showToast('Thank you for installing the app!', 'success');
              }
              setDeferredPrompt(null);
            }
          },
        });

        setHasPromptedPWA(true);
      }
    }, 45000); // 45.000ms

    return () => clearTimeout(timer);
  }, [deferredPrompt, hasPromptedPWA, setHasPromptedPWA, setDialog, showToast]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast('Thank you for installing Quiz Forge!', 'success');
    }

    setDeferredPrompt(null);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return {
    isDarkMode,
    toggleTheme,
    deferredPrompt,
    handleInstallApp,
    toast,
    showToast,
    dialog,
    setDialog,
  };
}
