import * as cheerio from "cheerio";
import crypto from "node:crypto";
import type { NewsItem, Parser } from "./types.js";

function makeId(url: string): string {
  return "ryutsuu-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
}

function parseDate(text: string): string {
  const match = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (!match) return "";
  // JST (UTC+9) 基準で判定（GitHub Actions は UTC で動作するため）
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const month = parseInt(match[1], 10) - 1;
  const day = parseInt(match[2], 10);
  let year = nowJST.getUTCFullYear();
  const candidate = new Date(Date.UTC(year, month, day));
  if (candidate > nowJST) year--;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const CATEGORY_MAP: Record<string, string> = {
  store: "店舗",
  sales: "売上",
  strategy: "経営",
  commodity: "商品",
  it: "IT",
  logistics: "物流",
  promotion: "販促",
  government: "行政",
  market: "市場動向",
};

function extractCategory(href: string): string {
  const match = href.match(/ryutsuu\.biz\/(\w+)\//);
  if (!match) return "";
  return CATEGORY_MAP[match[1]] || match[1];
}

export const ryutsuuParser: Parser = {
  source: "ryutsuu",
  sourceName: "流通ニュース",
  url: "https://www.ryutsuu.biz/",

  parse(html: string): NewsItem[] {
    const $ = cheerio.load(html);
    const items: NewsItem[] = [];

    $("li").each((_i, el) => {
      const $el = $(el);
      // 記事リンクを探す（ryutsuu.bizドメインまたは相対パス）
      const $link = $el.find('a[href*=".html"]').first();
      if (!$link.length) return;

      const href = $link.attr("href") || "";
      const title = $link.text().trim();
      if (!title || title.length < 5) return;

      const fullUrl = href.startsWith("http") ? href : `https://www.ryutsuu.biz${href}`;

      // 日付
      const spanText = $el.find("span").first().text().trim();
      const date = parseDate(spanText);
      if (!date) return;

      // カテゴリ
      const category = extractCategory(fullUrl);

      // タグ
      const tags: string[] = [];
      $el.find("ul a").each((_j, tagEl) => {
        const tagText = $(tagEl).text().trim();
        if (tagText && tagText.length < 20) tags.push(tagText);
      });

      items.push({
        id: makeId(fullUrl),
        title,
        url: fullUrl,
        source: "ryutsuu",
        sourceName: "流通ニュース",
        category,
        date,
        tags,
      });
    });

    return items;
  },
};
