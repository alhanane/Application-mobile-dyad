/**
 * Composant pour le prompt d'installation PWA
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isInstalled } = usePWA();

  // Ne pas afficher si déjà installé ou prompt fermé
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
        <div className="flex items-start gap-4">
          {/* Icône */}
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} className="text-indigo-600" />
          </div>

          {/* Contenu */}
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">
              Installer l'application
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Installez AL HANANE sur votre écran d'accueil pour un accès rapide et des notifications.
            </p>

            {/* Boutons */}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={installApp}
                className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                <Download size={16} className="mr-2" />
                Installer
              </Button>
              <Button
                onClick={dismissInstallPrompt}
                variant="outline"
                className="h-10 rounded-xl"
              >
                Plus tard
              </Button>
            </div>
          </div>

          {/* Fermer */}
          <button
            onClick={dismissInstallPrompt}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
