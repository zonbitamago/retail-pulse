import * as cheerio from "cheerio";
import crypto from "node:crypto";
import type { NewsItem, Parser } from "./types.js";

function makeId(url: string): string {
  return "diamond-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
}

function parseDate(text: string): string {
  // "2026/04/02" or "2026.04.02" format
  const match = text.match(/(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

const CATEGORY_MAP: Record<string, string> = {
  management: "経営戦略",
  store: "店舗",
  market: "市場動向",
  "flash-news": "ニュース速報",
  technology: "テクノロジー",
  logistics: "物流",
};

function extractCategory(href: string): string {
  const match = href.match(/diamond-rm\.net\/([^/]+)\//);
  if (!match) return "";
  return CATEGORY_MAP[match[1]] || match[1];
}

export const diamondChainParser: Parser = {
  source: "diamond-chain",
  sourceName: "DCS",
  url: "https://diamond-rm.net/",

  parse(html: string): NewsItem[] {
    const $ = cheerio.load(html);
    const items: NewsItem[] = [];

    // h3 > a パターンで記事を抽出
    $("h3 a, h4 a").each((_i, el) => {
      const $link = $(el);
      const href = $link.attr("href") || "";
      if (!href.includes("diamond-rm.net") && !href.startsWith("/")) return;

      const title = $link.text().trim();
      if (!title || title.length < 5) return;

      const fullUrl = href.startsWith("http") ? href : `https://diamond-rm.net${href}`;
      // 記事URLのパターンチェック（pathname の末尾が /数字/）
      try {
        const { pathname } = new URL(fullUrl);
        if (!/\/\d+\/?$/.test(pathname)) return;
      } catch {
        return;
      }

      const category = extractCategory(fullUrl);

      // 親要素から日付を探す
      const $parent = $link.closest("article, div, li");
      let date = "";
      $parent.find("time, span, .date, [class*='date']").each((_j, dateEl) => {
        if (date) return;
        const text = $(dateEl).text().trim();
        const parsed = parseDate(text);
        if (parsed) date = parsed;
      });

      // 日付が見つからない場合は親テキスト全体から探す
      if (!date) {
        const parentText = $parent.text();
        date = parseDate(parentText);
      }

      if (!date) return;

      items.push({
        id: makeId(fullUrl),
        title,
        url: fullUrl,
        source: "diamond-chain",
        sourceName: "DCS",
        category,
        date,
        tags: [],
      });
    });

    // 重複URL除去
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  },
};
