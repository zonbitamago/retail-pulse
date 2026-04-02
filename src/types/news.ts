export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceName: string;
  category: string;
  date: string;
  tags: string[];
}

export interface NewsData {
  lastUpdated: string;
  items: NewsItem[];
}
