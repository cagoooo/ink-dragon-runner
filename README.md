# 🐉 仙人掌大逃亡：奔跑吧小墨龍 (Ink Dragon Runner)

> **東方水墨畫風網頁無盡跑酷遊戲** ── 操控靈動的水墨小龍，避開重重仙人掌陣與空中的障礙物，挑戰最高分數記錄！

---

## 🔗 線上遊玩網址 (Live Demo)

👉 **[https://cagoooo.github.io/ink-dragon-runner/](https://cagoooo.github.io/ink-dragon-runner/)**

---

## 📌 開發進度與已完成里程碑 (Progress Status)

| 優先度 | 功能項目 | 狀態 | 說明 |
| :--- | :--- | :---: | :--- |
| **P0** | **Vite Base 相對與絕對子目錄修復** | ✅ 已完成 | 解決 GitHub Pages 子目錄 `./` 下 404 白屏問題 |
| **P0** | **GitHub Actions 官方 Pages 部署** | ✅ 已完成 | 建立 `.github/workflows/deploy.yml` 免手動 CI/CD 自動發布 |
| **P0** | **React Error Boundary 載入防護** | ✅ 已完成 | 避免 React 渲染例外死寂白屏，提供親切全繁中修復按鈕 |
| **P1** | **水墨風視覺與社群 OG 卡片** | ✅ 已完成 | 繪製 1200x630 `og-image.png`、`favicon.svg`、`favicon.png` 與 `apple-touch-icon.png` |
| **P1** | **Service Worker 升級提示彈窗 (v1.1.1)** | ✅ 已完成 | 修正 `install` 階段過早 `skipWaiting()` 導致更新提示消失的雷，提供自動更新 Toast |
| **P1** | **Vite Chunk Hash 錯誤自癒** | ✅ 已完成 | 自動擷取動態模組載入錯誤並引導重新整理 |
| **P1** | **[A1] 墨滴殘影與飛濺粒子系統** | ✅ 已完成 | 跳躍/落地水墨噴濺、步履墨痕殘影、護盾墨環與撞擊碎裂特效 |
| **P1** | **[A2] 國風音效分層與道具聲音** | ✅ 已完成 | 五聲音階和弦 (`playPowerUpCollect`)、護盾破裂脆響 (`playShieldBreak`) 與衝刺風鳴 (`playBoost`) |
| **P1** | **[B1] 水墨三大寶物道具系統** | ✅ 已完成 | 🛡️ 墨玉護盾、⚡ 神龍加速 (5s 無敵飛行衝刺)、🍄 水墨靈芝 (8s 得分 2x) 與 HUD 倒數列 |

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

---

<!-- BEGIN:PROJECT_GUIDE -->
## 專案導覽

這個 repository 收錄 **ink-dragon-runner** 專案的原始碼與相關資源。以下資訊依目前檔案結構整理；實際行為仍以程式碼與部署設定為準。

- 專案定位：互動遊戲／遊戲化學習專案
- Repository：`cagoooo/ink-dragon-runner`
- 可見性：公開
- 主要技術：TypeScript
- 線上入口：<https://cagoooo.github.io/ink-dragon-runner/>

### 可以怎麼應用

- 課堂暖身、複習活動或學習站任務
- 校慶、闖關或社團活動中的互動挑戰
- 替換題庫、美術、音效與規則後，延伸成其他學科或主題遊戲

這些是依目前專案定位整理的延伸方向，不代表所有情境都已內建完成；實作前請先確認現有功能與資料格式。

### 技術與專案結構

- `AGENTS.md`
- `README.md`
- `package.json`
- `scripts`

檔案結構會隨版本演進；若本節與程式碼不一致，以目前預設分支的原始碼為準。

### 本機執行

```bash
pnpm install
# build
pnpm build
```
請以 `package.json` 的 `scripts` 為準；若專案需要雲端服務，請先建立自己的環境變數與測試專案。

### 給 AI Agent 的接手指南

1. 先閱讀本 README、`AGENTS.md`（若有）、套件腳本與部署設定。
2. 先找出遊戲狀態、關卡／題庫資料與輸入控制的來源，再調整規則。
3. 更換素材時同步檢查授權、載入路徑、碰撞區域與不同螢幕比例。
4. 修改後至少驗證開始、遊玩、計分／勝負、重新開始，以及手機與桌面版面。
5. 不要捏造尚未存在的功能；README 與實作有落差時，應同時更新文件。
6. 提交前只納入本次任務檔案，並記錄實際執行過的驗證。

### 安全與資料注意事項

- 不要提交 `.env`、服務帳號、API 金鑰、token、學生個資或正式環境匯出資料。
- 使用 Firebase、Supabase、Google API 或其他雲端服務時，請建立自己的測試專案並套用最小權限。
- 若要公開衍生作品，請先確認程式碼、圖片、音訊、字型與教材內容的授權。

### 貢獻與客製化

歡迎依教學現場、活動或工作流程需求進行 fork／客製化。建議在變更說明中交代使用情境、主要修改、測試方式，以及是否影響資料格式或部署設定。
<!-- END:PROJECT_GUIDE -->
