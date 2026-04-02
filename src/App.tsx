import { useState, useMemo } from "react";
import { useNews } from "./hooks/useNews";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useReadStatus } from "./hooks/useReadStatus";
import { usePullToRefresh } from "./hooks/usePullToRefresh";
import { Header } from "./components/Header";
import { InstallBanner } from "./components/InstallBanner";
import { SearchBar } from "./components/SearchBar";
import { SourceFilter } from "./components/SourceFilter";
import { CategoryFilter } from "./components/CategoryFilter";
import { NewsList } from "./components/NewsList";
import { Analytics } from "./components/Analytics";
import "./App.css";

export default function App() {
  const { data, loading, error, refresh } = useNews();
  const { visible: showInstall, isIOS, install, dismiss } = useInstallPrompt();
  const { isRead, markAsRead } = useReadStatus();
  const { pulling } = usePullToRefresh(refresh);

  const [query, setQuery] = useState("");
  const [activeSource, setActiveSource] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const sources = useMemo(
    () =>
      data
        ? [...new Set(data.items.map((item) => item.source))].map((s) => ({
            id: s,
            name: data.items.find((item) => item.source === s)?.sourceName ?? s,
          }))
        : [],
    [data]
  );

  const categories = useMemo(
    () =>
      data
        ? [...new Set(data.items.map((item) => item.category))].filter(Boolean).sort()
        : [],
    [data]
  );

  const filteredItems = useMemo(() => {
    if (!data) return [];
    let items = data.items;

    if (activeSource !== "all") {
      items = items.filter((item) => item.source === activeSource);
    }
    if (activeCategory !== "all") {
      items = items.filter((item) => item.category === activeCategory);
    }
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return items;
  }, [data, activeSource, activeCategory, query]);

  return (
    <div className="app">
      <Header lastUpdated={data?.lastUpdated} />
      {showInstall && (
        <InstallBanner isIOS={isIOS} onInstall={install} onDismiss={dismiss} />
      )}
      {pulling && <div className="pull-indicator">更新中...</div>}
      <div className="layout">
        <main className="main">
          {loading && <p className="status">読み込み中...</p>}
          {error && <p className="status error">{error}</p>}
          {data && (
            <>
              <SearchBar value={query} onChange={setQuery} />
              <SourceFilter
                sources={sources}
                active={activeSource}
                onChange={setActiveSource}
              />
              <CategoryFilter
                categories={categories}
                active={activeCategory}
                onChange={setActiveCategory}
              />
              <NewsList
                items={filteredItems}
                isRead={isRead}
                onRead={markAsRead}
              />
            </>
          )}
        </main>
        {data && <Analytics items={data.items} />}
      </div>
    </div>
  );
}
