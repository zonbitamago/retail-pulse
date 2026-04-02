interface InstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallBanner({ onInstall, onDismiss }: InstallBannerProps) {
  return (
    <div className="install-banner">
      <p className="install-banner-text">
        ホーム画面に追加してアプリとして使えます
      </p>
      <div className="install-banner-actions">
        <button className="install-btn" onClick={onInstall}>
          インストール
        </button>
        <button className="install-dismiss-btn" onClick={onDismiss}>
          閉じる
        </button>
      </div>
    </div>
  );
}
