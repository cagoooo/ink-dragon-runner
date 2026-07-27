# 🐉 仙人掌大逃亡：奔跑吧小墨龍 專案開發與除錯守則 (AGENTS.md)

本檔案記錄了《仙人掌大逃亡：奔跑吧小墨龍》專案在 Vite + GitHub Pages + PWA 上線過程中的核心開發守則與踩雷正解。

---

## 🚨 1. Vite + GitHub Pages 部署與防白屏守則 (`github-pages-vite-pwa-deploy-trap`)

### 現象與根因
- 在 GitHub Pages (子目錄 `cagoooo.github.io/ink-dragon-runner/`) 部署時，如果 Vite 設定檔 `base` 設為 `./` 或是未指定，可能導致靜態資產 `assets/index-xxx.js` 被伺服器重定向回 `index.html` 文本，產生 JS 載入失敗 (404 / Silent Fail) 與一片空白 (White Screen)。

### 守則與解法
1. **Vite Base 配置**：`vite.config.ts` 中的 `base` 必須指定為與 Repository 名稱相同的絕對子目錄路徑 `/ink-dragon-runner/` 或環境變數。
2. **GitHub Actions 官方工作流**：在 `.github/workflows/deploy.yml` 必須包含 `permissions: { pages: write, id-token: write }` 並使用 `actions/upload-pages-artifact@v3` 與 `actions/deploy-pages@v4`。
3. **DOM 預載骨架**：在 `index.html` 的 `<div id="root">` 內置入預載動畫骨架，並包裹全域 `ErrorBoundary`，杜絕任何死寂白屏。

---

## 🚨 2. Service Worker 更新通知與 `skipWaiting` 守則

### 現象與根因
- 若在 `sw.js` 的 `install` 事件中直接執行了 `self.skipWaiting()`，全新 Service Worker 安裝完畢後會**立刻跳過 waiting 階段強行接管**，使前端 `navigator.serviceWorker.register()` 的 `reg.waiting` 永遠為 `null`，進而導致前端 `SWUpdateBanner.tsx` 的「發現新版本」更新提示彈窗永遠消失。

### 守則與解法
1. **嚴禁在 `install` 階段自動 `self.skipWaiting()`**：保持 Service Worker 在 `waiting` 狀態待命。
2. **前端手動觸發**：當使用者點擊「[立即更新]」按鈕時，透過 `postMessage({ type: 'SKIP_WAITING' })` 手動激活。
3. **主動更新檢查**：前端監聽 `visibilitychange` 與 `focus` 事件，自動執行 `reg.update()` 檢查伺服器新 SW。

---

## 🔗 關聯技能庫
- [`github-pages-vite-pwa-deploy-trap`](file:///C:/Users/smes/.gemini/config/skills/github-pages-vite-pwa-deploy-trap/SKILL.md)
- [`sw-update-prompt-version-gate`](file:///C:/Users/smes/.gemini/config/skills/sw-update-prompt-version-gate/SKILL.md)
- [`pwa-cache-bust`](file:///C:/Users/smes/.gemini/config/skills/pwa-cache-bust/SKILL.md)
