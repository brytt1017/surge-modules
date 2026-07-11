/**
 * Crypto Panel for Surge
 * 顯示 BTC / ETH / SOL 即時價格與 24h 漲跌
 * 資料來源：Binance 公開 API（免金鑰）
 * MIT License · Mingliang Lab
 */

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
const API = "https://api.binance.com/api/v3/ticker/24hr?symbols=" +
  encodeURIComponent(JSON.stringify(SYMBOLS));

function fmtPrice(p) {
  const n = parseFloat(p);
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toFixed(2);
  return n.toFixed(4);
}

function fmtPct(p) {
  const n = parseFloat(p);
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

$httpClient.get({ url: API, timeout: 8 }, (error, response, data) => {
  if (error || !data) {
    $done({
      title: "Crypto Panel",
      content: "取得行情失敗，請稍後再試",
      icon: "bitcoinsign.circle",
      "icon-color": "#e74c3c"
    });
    return;
  }

  try {
    const list = JSON.parse(data);
    const bySymbol = {};
    list.forEach(t => (bySymbol[t.symbol] = t));

    const lines = SYMBOLS.map(s => {
      const t = bySymbol[s];
      if (!t) return s.replace("USDT", "") + "  -";
      const name = s.replace("USDT", "");
      return `${name}  $${fmtPrice(t.lastPrice)}  (${fmtPct(t.priceChangePercent)})`;
    });

    const btcUp = parseFloat(bySymbol["BTCUSDT"]?.priceChangePercent || 0) >= 0;

    $done({
      title: "Crypto Panel · Binance",
      content: lines.join("\n"),
      icon: btcUp ? "chart.line.uptrend.xyaxis" : "chart.line.downtrend.xyaxis",
      "icon-color": btcUp ? "#2ecc71" : "#e74c3c"
    });
  } catch (e) {
    $done({
      title: "Crypto Panel",
      content: "資料解析失敗：" + e.message,
      icon: "exclamationmark.triangle",
      "icon-color": "#f39c12"
    });
  }
});
