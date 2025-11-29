
import { useState, useEffect, useCallback } from 'react';
import { BeforeInstallPromptEvent } from '../types';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // 1. Prevenir que Chrome muestre el banner nativo automáticamente
      e.preventDefault();
      
      // 2. Guardar el evento para dispararlo más tarde
      setDeferredPrompt(e);
      
      // 3. Comprobar si ya está instalada o en modo standalone para no mostrar
      // Note: matchMedia is generally supported in modern browsers
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setIsInstallable(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA installed successfully');
    };

    // Escuchar el evento
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    // 1. Mostrar el prompt de instalación nativo
    await deferredPrompt.prompt();

    // 2. Esperar la elección del usuario
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
    }

    // 3. Limpiar la referencia del evento (ya no se puede usar de nuevo)
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  return { isInstallable, handleInstallClick };
};
