import type { NewsItem } from "../types/news";
import { NewsCard } from "./NewsCard";

interface NewsListProps {
  items: NewsItem[];
}

export function NewsList({ items }: NewsListProps) {
  if (items.length === 0) {
    return <p className="status">ニュースがありません</p>;
  }

  return (
    <div className="news-list">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  );
}
