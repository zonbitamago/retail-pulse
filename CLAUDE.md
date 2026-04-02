# Retail Pulse

流通小売業のニュースサイトをスクレイピングし、一覧表示するPWA Webアプリ。

## Tech Stack

- **Frontend**: Vite + React + TypeScript (SPA)
- **PWA**: vite-plugin-pwa (manifest + Service Worker, NetworkFirst for news.json)
- **Scraping**: Node.js + cheerio (tsx で実行)
- **Hosting**: GitHub Pages (静的デプロイ)
- **CI/CD**: GitHub Actions (cron 6時間ごと → scrape → commit → deploy)

## Project Structure

```
scripts/          # スクレイピングスクリプト (tsx で実行)
  parsers/        # サイト別パーサー (Parser インターフェース実装)
src/              # React フロントエンド
  components/     # UIコンポーネント
  hooks/          # カスタムフック (useNews)
  types/          # 型定義
public/data/      # スクレイピング結果 JSON (自動生成、git管理)
.github/workflows # GitHub Actions
```

## Commands

- `npm run dev` — 開発サーバー起動
- `npm run build` — プロダクションビルド (`tsc -b && vite build`)
- `npm run scrape` — スクレイピング実行 (`tsx scripts/scrape.ts`)

## Conventions

- CSS は `src/App.css` に集約（CSS Modules不使用）
- パーサー追加時は `scripts/parsers/` に `Parser` インターフェースを実装し、`scripts/scrape.ts` の `parsers` 配列に追加
- `public/data/news.json` は自動生成ファイル。手動編集しない
- GitHub Pages の base path は `/retail-pulse/`
