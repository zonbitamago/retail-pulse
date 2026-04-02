import { useState, useCallback } from "react";

const STORAGE_KEY = "read-articles";

function loadRead(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useReadStatus() {
  const [readIds, setReadIds] = useState<Set<string>>(loadRead);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return { isRead, markAsRead };
}
