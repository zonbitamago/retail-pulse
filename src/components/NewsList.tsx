import type { NewsItem } from "../types/news";
import { NewsCard } from "./NewsCard";

interface NewsListProps {
  items: NewsItem[];
  isRead: (id: string) => boolean;
  onRead: (id: string) => void;
}

function getDateGroup(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return "今週";
  return "それ以前";
}

function groupByDate(items: NewsItem[]): Map<string, NewsItem[]> {
  const groups = new Map<string, NewsItem[]>();
  for (const item of items) {
    const group = getDateGroup(item.date);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(item);
  }
  return groups;
}

export function NewsList({ items, isRead, onRead }: NewsListProps) {
  if (items.length === 0) {
    return <p className="status">ニュースがありません</p>;
  }

  const groups = groupByDate(items);

  return (
    <div className="news-list">
      {[...groups.entries()].map(([label, groupItems]) => (
        <section key={label}>
          <h2 className="date-group-label">{label}</h2>
          {groupItems.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              isRead={isRead(item.id)}
              onRead={onRead}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
