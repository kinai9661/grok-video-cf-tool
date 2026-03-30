# Grok Video Generator — CF Worker 部署指南

## 檔案說明
- `grok-video-generator.html` — 前端 UI（可直接托管在 CF Pages）
- `worker.js` — Cloudflare Worker 後端（API 代理）
- `wrangler.toml` — Worker 設定檔

---

## 部署步驟

### 1. 安裝 Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. 設定 API Key（Secret）
```bash
wrangler secret put XAI_API_KEY
# 貼上你的 xai-xxxxxxxx key
```

### 3. 部署 Worker
```bash
cd grok-video-tool
wrangler deploy
```
部署完成後會輸出 Worker URL，例如：
`https://grok-video-worker.your-name.workers.dev`

### 4. 部署前端（CF Pages）
```bash
# 直接在 CF Dashboard → Pages → Upload assets
# 上傳 grok-video-generator.html 即可
```
或使用 wrangler pages deploy：
```bash
wrangler pages deploy . --project-name grok-video-ui
```

---

## API 對照表（新舊版本）

| 舊版 | 新版（官方） |
|---|---|
| `grok-video-normal` | `grok-imagine-video` |
| `/v1/video/generations` | `/v1/videos/generations` |
| `aspectRatio` | `aspect_ratio` |
| `quality` | `resolution` |
| 無 request_id 輪詢 | POST → 取 id → GET /v1/videos/{id} |

Worker 會自動做新舊版本兼容轉換。

---

## 環境變數
| 變數 | 說明 |
|---|---|
| `XAI_API_KEY` | xAI API Key（用 `wrangler secret put` 設定） |
