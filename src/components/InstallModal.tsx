interface InstallModalProps {
  onClose: () => void;
}

export default function InstallModal({ onClose }: InstallModalProps) {
  return (
    <div className="install-modal">
      <div className="install-modal__content">
        <img
          className="install-modal__icon"
          src="/icon-192.png"
          alt="Ícone do NewAsk"
          width={96}
          height={96}
        />
        <h2 className="install-modal__title serif">NewAsk</h2>
        <p className="install-modal__description">
          Adicione este app à tela inicial do seu celular para usar em tela cheia.
        </p>
        <button className="install-modal__primary" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  );
}
