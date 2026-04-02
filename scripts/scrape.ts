import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Parser, NewsItem } from "./parsers/types.js";
import { ryutsuuParser } from "./parsers/ryutsuu.js";
import { diamondChainParser } from "./parsers/diamond-chain.js";
import { ssnpParser } from "./parsers/ssnp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "public", "data", "news.json");
const MAX_ITEMS = 300;

const parsers: Parser[] = [ryutsuuParser, diamondChainParser, ssnpParser];

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RetailPulseBot/1.0; +https://github.com/zonbitamago/retail-pulse)",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function scrapeOne(parser: Parser): Promise<NewsItem[]> {
  try {
    console.log(`Fetching ${parser.sourceName} (${parser.url})...`);
    const html = await fetchHTML(parser.url);
    const items = parser.parse(html);
    console.log(`  -> ${items.length} articles found`);
    return items;
  } catch (err) {
    console.error(`  -> Error scraping ${parser.sourceName}:`, err);
    return [];
  }
}

function loadExisting(): NewsItem[] {
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
    const data = JSON.parse(raw) as { items: NewsItem[] };
    return data.items || [];
  } catch {
    return [];
  }
}

function dedup(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

async function main() {
  console.log("=== Retail Pulse Scraper ===\n");

  // 並列フェッチ
  const results = await Promise.all(parsers.map(scrapeOne));
  const newItems = results.flat();

  if (newItems.length === 0) {
    console.error("ERROR: 全ソースから0件。スクレイパーの動作を確認してください。");
    process.exit(1);
  }

  // 既存データとマージ・重複排除・空日付除外
  const existing = loadExisting();
  const merged = dedup([...newItems, ...existing]).filter((item) => item.date.length > 0);

  // 日付降順ソート、上限
  merged.sort((a, b) => b.date.localeCompare(a.date));
  const final = merged.slice(0, MAX_ITEMS);

  const output = {
    lastUpdated: new Date().toISOString(),
    items: final,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\nDone! ${final.length} articles saved to ${OUTPUT_PATH}`);
}

main();
