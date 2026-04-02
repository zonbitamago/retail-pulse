import { useMemo } from "react";
import type { NewsItem } from "../types/news";

interface AnalyticsProps {
  items: NewsItem[];
}

function countBy<T>(arr: T[], key: (item: T) => string): [string, number][] {
  const map = new Map<string, number>();
  for (const item of arr) {
    const k = key(item);
    if (k) map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function BarChart({ data, color }: { data: [string, number][]; color: string }) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div className="analytics-bars">
      {data.map(([label, value]) => (
        <div key={label} className="analytics-bar-row">
          <span className="analytics-bar-label">{label}</span>
          <div className="analytics-bar-track">
            <div
              className="analytics-bar-fill"
              style={{ width: `${(value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="analytics-bar-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ items }: { items: NewsItem[] }) {
  const dailyCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (item.date) map.set(item.date, (map.get(item.date) || 0) + 1);
    }
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.slice(-14); // 直近14日
  }, [items]);

  if (dailyCounts.length === 0) return null;

  const max = Math.max(...dailyCounts.map(([, v]) => v), 1);
  const barWidth = 100 / dailyCounts.length;

  return (
    <div className="analytics-daily">
      <svg viewBox="0 0 400 120" className="analytics-daily-svg">
        {dailyCounts.map(([date, count], i) => {
          const h = (count / max) * 90;
          const x = i * (400 / dailyCounts.length) + barWidth * 0.15;
          const w = (400 / dailyCounts.length) * 0.7;
          return (
            <g key={date}>
              <rect
                x={x}
                y={100 - h}
                width={w}
                height={h}
                rx="3"
                fill="#1a73e8"
                opacity="0.7"
              />
              <text
                x={x + w / 2}
                y={115}
                textAnchor="middle"
                fontSize="9"
                fill="#999"
              >
                {date.slice(5)} {/* MM-DD */}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Analytics({ items }: AnalyticsProps) {
  const sourceCounts = useMemo(() => countBy(items, (i) => i.sourceName), [items]);
  const categoryCounts = useMemo(
    () => countBy(items, (i) => i.category).slice(0, 8),
    [items]
  );
  const tagCounts = useMemo(() => {
    const all = items.flatMap((i) => i.tags);
    const map = new Map<string, number>();
    for (const tag of all) {
      map.set(tag, (map.get(tag) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [items]);

  return (
    <aside className="analytics">
      <div className="analytics-card">
        <h3 className="analytics-title">記事数の推移（14日間）</h3>
        <DailyChart items={items} />
      </div>

      <div className="analytics-card">
        <h3 className="analytics-title">ソース別</h3>
        <BarChart data={sourceCounts} color="#1a73e8" />
      </div>

      <div className="analytics-card">
        <h3 className="analytics-title">カテゴリ TOP 8</h3>
        <BarChart data={categoryCounts} color="#34a853" />
      </div>

      {tagCounts.length > 0 && (
        <div className="analytics-card">
          <h3 className="analytics-title">注目キーワード</h3>
          <div className="analytics-tags">
            {tagCounts.map(([tag, count]) => (
              <span key={tag} className="analytics-tag">
                {tag}
                <span className="analytics-tag-count">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-card analytics-summary">
        <div className="analytics-stat">
          <span className="analytics-stat-value">{items.length}</span>
          <span className="analytics-stat-label">総記事数</span>
        </div>
        <div className="analytics-stat">
          <span className="analytics-stat-value">{sourceCounts.length}</span>
          <span className="analytics-stat-label">ソース数</span>
        </div>
        <div className="analytics-stat">
          <span className="analytics-stat-value">{categoryCounts.length}</span>
          <span className="analytics-stat-label">カテゴリ数</span>
        </div>
      </div>
    </aside>
  );
}
