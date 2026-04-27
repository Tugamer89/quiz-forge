import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useAppUI() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('quiz_theme_dark', false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const root = document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    globalThis.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => globalThis.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false }), 3000);
  }, []);

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
