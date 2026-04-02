# Retail Pulse

流通小売業の最新ニュースをまとめてチェックできるPWA Webアプリです。

## Features

- 流通ニュース・ダイヤモンド・チェーンストアオンラインから自動でニュースを収集
- ソース別フィルターで素早く絞り込み
- モバイルファーストのレスポンシブUI
- PWA対応 — スマホのホーム画面に追加してアプリとして利用可能
- GitHub Actionsで6時間ごとに自動更新

## Tech Stack

| 領域 | 技術 |
|------|------|
| Frontend | Vite + React + TypeScript |
| PWA | vite-plugin-pwa (Workbox) |
| Scraping | Node.js + cheerio |
| CI/CD | GitHub Actions (cron) |
| Hosting | GitHub Pages |

## Getting Started

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# スクレイピング実行
npm run scrape

# プロダクションビルド
npm run build
```

## Deploy

1. GitHubリポジトリの Settings > Pages > Source を **GitHub Actions** に設定
2. Actions タブから **Scrape & Deploy** を手動実行、またはcronによる自動実行を待つ

## Project Structure

```
scripts/          スクレイピングスクリプト
  parsers/        サイト別パーサー
src/              React フロントエンド
  components/     UIコンポーネント
  hooks/          カスタムフック
  types/          型定義
public/data/      スクレイピング結果JSON（自動生成）
.github/workflows GitHub Actions
```

## Adding a News Source

1. `scripts/parsers/` に `Parser` インターフェースを実装したファイルを追加
2. `scripts/scrape.ts` の `parsers` 配列にインポート・追加

## License

MIT
