# Grok Video Generator

一個基於 xAI Grok API 的影片生成工具，前端部署到 Cloudflare Pages，後端 Worker 作為 API 代理。

## 功能

- 🎬 **文字生成影片** — 輸入 Prompt 直接生成
- 🖼️ **圖片生成影片** — 上傳圖片加入動態效果
- 📊 **即時狀態追蹤** — 自動輪詢 + 進度條 + 日誌
- 🌙 **深色/淺色模式** — 自動跟隨系統偏好
- 📜 **生成歷史** — Session 內保存，可重播

## 快速部署

```bash
npm install -g wrangler
wrangler login
wrangler secret put XAI_API_KEY
wrangler deploy
```

詳細說明請參考 [DEPLOY.md](./DEPLOY.md)

## 技術棧

- **前端**: 純 HTML/CSS/JS（無框架，可直接部署到 CF Pages）
- **後端**: Cloudflare Worker（Edge Runtime）
- **API**: xAI Grok Video API
