import type { NewsItem } from "../types/news";

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return `${days}日前`;
  return dateStr;
}

interface NewsCardProps {
  item: NewsItem;
  isRead: boolean;
  onRead: (id: string) => void;
}

export function NewsCard({ item, isRead, onRead }: NewsCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`news-card ${isRead ? "read" : ""}`}
      onClick={() => onRead(item.id)}
    >
      <div className="news-card-header">
        <span className="news-source">{item.sourceName}</span>
        <span className="news-date">
          {isRead && <span className="news-read-badge">既読</span>}
          {relativeDate(item.date)}
        </span>
      </div>
      <h3 className="news-title">{item.title}</h3>
      <div className="news-tags">
        <span className="news-category">{item.category}</span>
        {item.tags.map((tag) => (
          <span key={tag} className="news-tag">
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
