interface InstallBannerProps {
  isIOS: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallBanner({ isIOS, onInstall, onDismiss }: InstallBannerProps) {
  return (
    <div className="install-banner">
      {isIOS ? (
        <p className="install-banner-text">
          共有ボタン
          <svg className="install-ios-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h3v2H6v11h12V10h-3V8h3a2 2 0 012 2z" />
          </svg>
          から「ホーム画面に追加」でアプリとして使えます
        </p>
      ) : (
        <p className="install-banner-text">
          ホーム画面に追加してアプリとして使えます
        </p>
      )}
      <div className="install-banner-actions">
        {!isIOS && (
          <button className="install-btn" onClick={onInstall}>
            インストール
          </button>
        )}
        <button className="install-dismiss-btn" onClick={onDismiss}>
          閉じる
        </button>
      </div>
    </div>
  );
}
