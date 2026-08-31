# Mingliang Lab · Surge 模組

![License](https://img.shields.io/badge/license-MIT-blue) ![Platform](https://img.shields.io/badge/platform-Surge%20iOS%20%2F%20Mac-orange) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

一組自用也分享的 [Surge](https://nssurge.com/) 模組與面板腳本：廣告封鎖、隱私防護、加密貨幣行情面板、網路資訊面板。全部開源、規則透明，每一條擋了什麼都看得到。

> 本 repo 只做合法用途的模組（去廣告、防追蹤、資訊面板），不提供任何解鎖付費功能的腳本。

## 模組列表

| 模組 | 功能 | 類型 |
|------|------|------|
| [AdBlock 廣告封鎖](modules/adblock.sgmodule) | 封鎖常見廣告聯播網與影音貼片廣告域名 | Rule |
| [Privacy Guard 隱私防護](modules/privacy-guard.sgmodule) | 封鎖行為追蹤、數據回傳與熱圖錄製服務 | Rule |
| [Crypto Panel 加密貨幣面板](modules/crypto-panel.sgmodule) | Surge 首頁直接顯示 BTC / ETH / SOL 即時價格與 24h 漲跌（Binance 公開 API） | Panel |
| [ICT Killzone 面板](modules/killzone-panel.sgmodule) | 顯示目前的 ICT Killzone（亞洲／倫敦／紐約 AM／倫敦收盤／紐約 PM）、剩餘時間與下一個時段，交易員專用 | Panel |
| [恐懼貪婪指數面板](modules/fear-greed-panel.sgmodule) | 加密市場 Fear & Greed Index，今日 vs 昨日情緒對比 | Panel |
| [美股時段面板](modules/us-market-panel.sgmodule) | 美股盤前／盤中／盤後／休市狀態、下一個轉換點倒數，含 NYSE 休市日與提早收盤日，免 API | Panel |
| [Network Info 網路資訊面板](modules/network-info.sgmodule) | 顯示目前出口 IP、ISP、所在地區 | Panel |

## 安裝方式

1. 在 iOS / Mac 上安裝 [Surge](https://nssurge.com/) 並啟用完整版
2. 前往本 repo 的 [安裝頁面](index.html)（或直接複製下方模組的 Raw 連結）
3. Surge →「模組」→「安裝新模組」→ 貼上連結
4. Panel 類模組安裝後，回到 Surge 首頁即可看到面板

手動安裝連結格式：

```
https://raw.githubusercontent.com/brytt1017/surge-modules/main/modules/adblock.sgmodule
```

## 常見問題

**Q：需要開 MitM 嗎？**
目前所有模組都不需要 MitM 與解密憑證，安裝即用。

**Q：面板多久更新一次？**
Crypto Panel 與美股時段面板預設 5 分鐘，Network Info 預設 10 分鐘，恐懼貪婪指數預設 1 小時，可在 `.sgmodule` 內自行調整 `update-interval`。

**Q：美股時段面板的休市日要自己更新嗎？**
內建 NYSE 2026–2027 的休市日與提早收盤日，之後年度請更新 `scripts/us-market-panel.js` 開頭的 `HOLIDAYS` 與 `HALF_DAYS`（或開 PR）。

**Q：某條規則誤擋了正常網站？**
開 [Issue](../../issues) 附上域名，我會盡快處理。

## 貢獻

歡迎 PR 補充規則或新面板。規則請附上來源說明（這個域名是誰的、為什麼要擋）。

## 免責聲明

本專案僅供學習與個人網路管理使用。加密貨幣價格資訊來自 Binance 公開 API，僅供參考，不構成投資建議。

## 授權

[MIT License](LICENSE)
