/**
 * Hook pour la gestion PWA
 * Installation, mise à jour et état de l'application
 */

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  showInstallPrompt: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  updateAvailable: boolean;
  updateApp: () => void;
}

export function usePWA(): UsePWAReturn {
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Vérifier si l'app est déjà installée (standalone)
  const isStandalone = typeof window !== 'undefined' && 
                       (window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true);

  const isInstalled = isStandalone;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Écouter l'événement d'installation disponible
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);

      // Vérifier si on doit afficher le prompt
      const lastPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      if (!lastPrompt || parseInt(lastPrompt) < oneDayAgo) {
        setShowInstallPrompt(true);
      }
    };

    // Écouter les mises à jour du service worker
    const handleControllerChange = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

    // Vérifier les mises à jour du SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setCanInstall(false);
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', Date.now().toString());
  }, []);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  return {
    isInstalled,
    isStandalone,
    canInstall,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
    updateAvailable,
    updateApp,
  };
}
