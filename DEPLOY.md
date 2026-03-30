# Grok Video Generator — 部署指南

## 架構

```
瀏覽器 (CF Pages)
    └──> Cloudflare Worker (API 代理)
              └──> xAI API (api.x.ai)
```

## 環境需求

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- xAI API Key ([console.x.ai](https://console.x.ai))

---

## Step 1 — 部署 Worker

```bash
# 登入 Cloudflare
wrangler login

# 設定 API Key（不會明文儲存）
wrangler secret put XAI_API_KEY
# 貼上你的 xai-xxxxx key 並按 Enter

# 部署 Worker
wrangler deploy

# 輸出範例：
# https://grok-video-generator.<your-subdomain>.workers.dev
```

---

## Step 2 — 部署前端 (CF Pages)

```bash
wrangler pages deploy . --project-name grok-video-ui
```

或直接在 Cloudflare Dashboard → Pages → 連接此 GitHub 倉庫

---

## Step 3 — 使用

1. 開啟前端頁面 `grok-video-generator.html`
2. 填入 Worker URL（Step 1 輸出的 URL）
3. 輸入 Prompt，設定參數，點擊「開始生成」
4. 等待 AI 生成（通常 1-3 分鐘）
5. 生成完成後可預覽、下載、複製連結

---

## Worker API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/generate` | POST | 文字生成影片 |
| `/generate-from-image` | POST | 圖片生成影片 |
| `/status/:requestId` | GET | 查詢生成狀態 |
| `/health` | GET | 健康檢查 |

### 請求範例

```bash
# 文字生成
curl -X POST https://your-worker.workers.dev/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "一隻貓咪在草地上奔跑", "duration": 10, "aspect_ratio": "16:9"}'

# 查詢狀態
curl https://your-worker.workers.dev/status/<request_id>
```

---

## 常見問題

**Q: 生成失敗 `XAI_API_KEY not configured`**
A: 執行 `wrangler secret put XAI_API_KEY` 重新設定

**Q: CORS 錯誤**
A: Worker 已內建 CORS headers，確認 Worker URL 正確即可

**Q: 影片一直顯示「處理中」**
A: xAI 影片生成通常需要 1-5 分鐘，請耐心等待
