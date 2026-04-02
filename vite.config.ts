import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/retail-pulse/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Retail Pulse - 流通小売ニュース",
        short_name: "Retail Pulse",
        description: "流通小売業の最新ニュースをまとめてチェック",
        theme_color: "#1a73e8",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/retail-pulse/",
        scope: "/retail-pulse/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /data\/news\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "news-data",
              expiration: { maxAgeSeconds: 4 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
