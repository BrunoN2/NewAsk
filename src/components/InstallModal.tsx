import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SKIP_KEY = 'nuvask.skip-install';

interface InstallModalProps {
  onClose: () => void;
}

export default function InstallModal({ onClose }: InstallModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

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
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onClose();
      }
      setDeferredPrompt(null);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, 'true');
    onClose();
  };

  const primaryLabel = deferredPrompt
    ? 'INSTALAR APP'
    : isIos
      ? 'COMO INSTALAR'
      : 'ADICIONAR À TELA INICIAL';

  return (
    <div className="install-modal">
      <div className="install-modal__content">
        <img
          className="install-modal__icon"
          src="/icon-192.png"
          alt="Ícone do NuvAsk"
          width={96}
          height={96}
        />
        <h2 className="install-modal__title serif">NuvAsk · O FOCO</h2>
        <p className="install-modal__tagline">
          Seu espaço para foco, calendário, notícias e sons.
        </p>
        <p className="install-modal__description">
          Adicione à tela inicial para usar como um app de verdade — tela cheia, offline e sem barra de endereço.
        </p>

        {showIosTip ? (
          <div className="install-modal__ios-tip">
            <p>
              No Safari, toque no botão <strong>Compartilhar</strong> na barra inferior e depois em <strong>Adicionar à Tela de Início</strong>.
            </p>
            <button className="install-modal__primary" onClick={() => setShowIosTip(false)} type="button">
              ENTENDI
            </button>
          </div>
        ) : (
          <div className="install-modal__actions">
            <button
              className="install-modal__primary"
              onClick={() => {
                if (deferredPrompt) {
                  void handleInstall();
                } else if (isIos) {
                  setShowIosTip(true);
                } else {
                  setShowIosTip(true);
                }
              }}
              type="button"
            >
              {primaryLabel}
            </button>
            <button className="install-modal__secondary" onClick={handleSkip} type="button">
              Continuar sem instalar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
