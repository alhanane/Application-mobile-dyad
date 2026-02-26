/**
 * Hook pour Firebase Cloud Messaging
 * Enregistrement et gestion des notifications push
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseFCMReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  error: string | null;
}

export function useFCM(): UseFCMReturn {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  // Vérifier le support FCM
  const isSupported = typeof window !== 'undefined' && 
                      'serviceWorker' in navigator && 
                      'PushManager' in window;

  useEffect(() => {
    if (!isSupported) return;

    // Vérifier la permission actuelle
    setPermission(Notification.permission);

    // Vérifier si déjà abonné
    checkSubscription();
  }, [isSupported]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Erreur vérification subscription:', err);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Les notifications ne sont pas supportées par ce navigateur.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (err) {
      setError('Impossible de demander la permission.');
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Les notifications ne sont pas supportées.');
      return false;
    }

    setError(null);

    // Demander la permission si nécessaire
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        setError('Permission de notification refusée.');
        return false;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Demander un nouvel abonnement
      // Note: En production, il faut utiliser une VAPID key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: undefined // TODO: Ajouter VAPID key
      });

      // Envoyer le token au serveur
      const token = btoa(JSON.stringify(subscription.toJSON()));
      
      await api.post('/device/register.php', {
        token,
        platform: 'web',
        device_name: navigator.userAgent.split(' ').slice(-2).join(' '),
        app_version: '2.0.0'
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Erreur abonnement FCM:', err);
      setError('Impossible de s\'abonner aux notifications.');
      return false;
    }
  }, [isSupported, permission, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Désabonner du navigateur
        await subscription.unsubscribe();

        // Notifier le serveur
        const token = btoa(JSON.stringify(subscription.toJSON()));
        await api.post('/device/unregister.php', { token });
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Erreur désabonnement FCM:', err);
      setError('Impossible de se désabonner.');
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    error,
  };
}
