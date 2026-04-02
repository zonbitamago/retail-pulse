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

export interface Parser {
  source: string;
  sourceName: string;
  url: string;
  parse(html: string): NewsItem[];
}
