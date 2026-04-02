import { useState } from "react";
import { useNews } from "./hooks/useNews";
import { Header } from "./components/Header";
import { SourceFilter } from "./components/SourceFilter";
import { NewsList } from "./components/NewsList";
import "./App.css";

export default function App() {
  const { data, loading, error } = useNews();
  const [activeSource, setActiveSource] = useState("all");

  const sources = data
    ? [...new Set(data.items.map((item) => item.source))].map((s) => ({
        id: s,
        name: data.items.find((item) => item.source === s)?.sourceName ?? s,
      }))
    : [];

  const filteredItems = data
    ? activeSource === "all"
      ? data.items
      : data.items.filter((item) => item.source === activeSource)
    : [];

  return (
    <div className="app">
      <Header lastUpdated={data?.lastUpdated} />
      <main className="main">
        {loading && <p className="status">読み込み中...</p>}
        {error && <p className="status error">{error}</p>}
        {data && (
          <>
            <SourceFilter
              sources={sources}
              active={activeSource}
              onChange={setActiveSource}
            />
            <NewsList items={filteredItems} />
          </>
        )}
      </main>
    </div>
  );
}
