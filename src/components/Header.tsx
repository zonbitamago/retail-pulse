interface HeaderProps {
  lastUpdated?: string;
}

export function Header({ lastUpdated }: HeaderProps) {
  const formatted = lastUpdated
    ? new Date(lastUpdated).toLocaleString("ja-JP", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <header className="header">
      <h1 className="header-title">Retail Pulse</h1>
      <p className="header-subtitle">流通小売ニュース</p>
      {formatted && <p className="header-updated">最終更新: {formatted}</p>}
    </header>
  );
}
