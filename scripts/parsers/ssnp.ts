import * as cheerio from "cheerio";
import crypto from "node:crypto";
import type { NewsItem, Parser } from "./types.js";

function makeId(url: string): string {
  return "ssnp-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
}

function parseDate(text: string): string {
  const match = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

const CATEGORY_MAP: Record<string, string> = {
  distribution: "流通",
  beverage: "飲料",
  snack: "菓子",
  meat: "畜産",
  dairy: "乳製品",
  soy: "大豆",
  frozen: "冷凍食品",
  noodle: "麺類",
  seasoning: "調味料",
  rice: "米",
};

function extractCategory(href: string): string {
  const match = href.match(/ssnp\.co\.jp\/([^/]+)\//);
  if (!match) return "";
  return CATEGORY_MAP[match[1]] || match[1];
}

export const ssnpParser: Parser = {
  source: "ssnp",
  sourceName: "食品産業新聞",
  url: "https://www.ssnp.co.jp/news/",

  parse(html: string): NewsItem[] {
    const $ = cheerio.load(html);
    const items: NewsItem[] = [];
    const seen = new Set<string>();

    $('a[href*="ssnp.co.jp/"]').each((_i, el) => {
      const $link = $(el);
      const href = $link.attr("href") || "";
      // 記事URLパターン: /category/数字/
      if (!/\/\d+\/$/.test(href)) return;
      if (href.includes("/news/")) return; // インデックスページ除外

      const text = $link.text().trim();
      const date = parseDate(text);
      if (!date) return;

      // 日付部分を除去してタイトルを取得
      const title = text.replace(/\d{4}年\d{1,2}月\d{1,2}日/, "").trim();
      if (!title || title.length < 5) return;

      const fullUrl = href.startsWith("http") ? href : `https://www.ssnp.co.jp${href}`;
      if (seen.has(fullUrl)) return;
      seen.add(fullUrl);

      const category = extractCategory(fullUrl);

      items.push({
        id: makeId(fullUrl),
        title,
        url: fullUrl,
        source: "ssnp",
        sourceName: "食品産業新聞",
        category,
        date,
        tags: [],
      });
    });

    return items;
  },
};
