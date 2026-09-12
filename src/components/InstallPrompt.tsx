import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream: boolean }).MSStream;
    setIsIos(isIOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="install-prompt">
        <span className="install-prompt__text">Instalar NuvAsk no celular</span>
        <button className="install-prompt__btn" onClick={handleInstall} type="button">
          Instalar
        </button>
        <button
          className="install-prompt__close"
          onClick={() => setDismissed(true)}
          aria-label="Fechar"
          type="button"
        >
          ×
        </button>
      </div>
    );
  }

  if (isIos && !('standalone' in navigator && (navigator as Navigator & { standalone: boolean }).standalone)) {
    return (
      <div className="install-prompt install-prompt--ios">
        <span className="install-prompt__text">
          Toque em Compartilhar e depois “Adicionar à Tela de Início”.
        </span>
        <button
          className="install-prompt__close"
          onClick={() => setDismissed(true)}
          aria-label="Fechar"
          type="button"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
