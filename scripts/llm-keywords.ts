import type { NewsItem } from "./parsers/types.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const BATCH_SIZE = 30; // 1リクエストあたりの記事数

const SYSTEM_PROMPT = `あなたは流通小売業の専門家です。
以下のニュース記事タイトルのリストから、各タイトルに対してキーワードを抽出してください。

抽出するキーワードのカテゴリ:
- 企業名・ブランド名
- 業態（コンビニ、スーパー、ドラッグストア等）
- テーマ・トレンド（DX、AI、サステナビリティ等）
- 商品カテゴリ（食品、飲料、日用品等）
- 経営アクション（出店、M&A、決算等）

ルール:
- 各タイトルにつき1〜5個のキーワードを抽出
- 正式名称を使用（略称は正式名に統一）
- JSON配列の配列で返す（外側が記事、内側がキーワード）
- 説明や前置きは不要。JSONのみ返すこと`;

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

async function callGemini(titles: string[]): Promise<string[][]> {
  if (!GEMINI_API_KEY) return titles.map(() => []);

  const prompt = titles.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const body = {
    contents: [
      {
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    console.error(`  Gemini API error: HTTP ${res.status}`);
    return titles.map(() => []);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // JSONブロックを抽出（```json ... ``` またはそのまま）
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("  Gemini: JSONパース失敗");
    return titles.map(() => []);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as string[][];
    // 件数が合わない場合は安全に処理
    return titles.map((_, i) =>
      Array.isArray(parsed[i])
        ? parsed[i].filter((k): k is string => typeof k === "string")
        : []
    );
  } catch {
    console.error("  Gemini: JSONパース失敗");
    return titles.map(() => []);
  }
}

export async function enrichWithLLM(items: NewsItem[]): Promise<void> {
  if (!GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY not set, skipping LLM keyword extraction");
    return;
  }

  // タグが1個以下の記事を対象にする
  const targets = items.filter((item) => item.tags.length <= 1);
  if (targets.length === 0) {
    console.log("  -> LLM補完対象なし");
    return;
  }

  console.log(`\nLLM keyword extraction (${targets.length} articles)...`);

  // バッチ処理
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const titles = batch.map((item) => item.title);

    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} articles`);
    const keywords = await callGemini(titles);

    for (let j = 0; j < batch.length; j++) {
      const existing = new Set(batch[j].tags);
      for (const kw of keywords[j]) {
        existing.add(kw);
      }
      batch[j].tags = [...existing];
    }

    // レートリミット対策（15 RPM = 4秒間隔）
    if (i + BATCH_SIZE < targets.length) {
      await new Promise((resolve) => setTimeout(resolve, 4500));
    }
  }

  const enriched = targets.filter((item) => item.tags.length > 1).length;
  console.log(`  -> ${enriched}/${targets.length} articles enriched`);
}
