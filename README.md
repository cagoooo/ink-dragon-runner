# 🐉 仙人掌大逃亡：奔跑吧小墨龍 (Ink Dragon Runner)

> **東方水墨畫風網頁無盡跑酷遊戲** ── 操控靈動的水墨小龍，避開重重仙人掌陣與空中的障礙物，挑戰最高分數記錄！

---

## 🔗 線上遊玩網址 (Live Demo)

👉 **[https://cagoooo.github.io/ink-dragon-runner/](https://cagoooo.github.io/ink-dragon-runner/)**

---

## 📌 開發進度與已完成里程碑 (Progress Status)

| 階段 | 功能項目 | 狀態 | 說明 |
| :--- | :--- | :---: | :--- |
| **P0** | **Vite Base 相對路徑修復** | ✅ 已完成 | 解決 GitHub Pages 子目錄 `./` 下 404 白屏問題 |
| **P0** | **GitHub Actions 官方 Pages 部署** | ✅ 已完成 | 建立 `.github/workflows/deploy.yml` 實現免手動 CI/CD 自動發布 |
| **P0** | **React Error Boundary 載入防護** | ✅ 已完成 | 避免 React 渲染例外死寂白屏，提供親切全繁中修復按鈕 |
| **P1** | **水墨風視覺與社群 OG 卡片** | ✅ 已完成 | 繪製 1200x630 `og-image.png`、`favicon.svg`、`favicon.png` 與 `apple-touch-icon.png` |
| **P1** | **Service Worker 自動更新提示** | ✅ 已完成 | 整合 `sw.js` (v1.0.1) 與 `SWUpdateBanner.tsx` 浮動更新提示 Toast |
| **P1** | **Vite Chunk Hash 錯誤自癒** | ✅ 已完成 | 自動擷取動態模組載入錯誤並引導重新整理 |

---

## ✨ 遊戲特色 (Features)

1. **極致水墨視覺美學**：採用質感優雅的水墨渲染風格，將傳統畫風與現代動態結合。
2. **直覺流暢的操作體驗**：
   - 鍵盤：`空白鍵 (Space)` 或 `上箭號 (Up)` 跳躍，`下箭號 (Down)` 快速俯衝。
   - 觸控：手機與平板支援點擊跳躍，RWD 全面響應式設計！
3. **無盡挑戰與得分系統**：隨著奔跑距離增加，遊戲速度與障礙難度會逐漸提升，考驗反應神經！
4. **PWA 快取與自動升級**：內建 SW 快取機制，離線也能秒開，並會主動提示新版本升級。

---

## 🎮 操作說明 (Controls)

| 動作 | 鍵盤按鍵 | 手機 / 平板觸控 |
| :--- | :--- | :--- |
| **跳躍 (Jump)** | `Space` / `↑` | 點擊螢幕任意位置 |
| **俯衝 (Duck)** | `↓` | 往下滑動 |
| **重新開始 (Restart)** | `Enter` / `Space` | 點擊「重新開始」按鈕 |

---

## 🛠️ 技術架構 (Tech Stack)

- **前端框架**：React 19 + TypeScript
- **建置工具**：Vite + pnpm
- **樣式庫**：Tailwind CSS
- **部署自動化**：GitHub Actions + GitHub Pages (`actions/deploy-pages@v4`)

---

## 👨‍🏫 作者資訊 (Author)

- **作者**：阿凱老師 (Akai / cagoooo)
- **專案發布**：[cagoooo/ink-dragon-runner](https://github.com/cagoooo/ink-dragon-runner)
