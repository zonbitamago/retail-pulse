import { useState, useEffect, useCallback } from "react";
import type { NewsData } from "../types/news";

export function useNews() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(import.meta.env.BASE_URL + "data/news.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: NewsData) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { data, loading, error, refresh: fetchNews };
}
