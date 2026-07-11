/**
 * Crypto Fear & Greed Panel for Surge
 * 顯示加密市場恐懼貪婪指數（今日 vs 昨日）
 * 資料來源：alternative.me 公開 API（免金鑰）
 * MIT License · Mingliang Lab
 */

const API = "https://api.alternative.me/fng/?limit=2";

function mood(v) {
  if (v <= 20) return { label: "極度恐懼", emoji: "😱", color: "#e74c3c" };
  if (v <= 40) return { label: "恐懼", emoji: "😨", color: "#e67e22" };
  if (v <= 60) return { label: "中性", emoji: "😐", color: "#f1c40f" };
  if (v <= 80) return { label: "貪婪", emoji: "😏", color: "#2ecc71" };
  return { label: "極度貪婪", emoji: "🤑", color: "#27ae60" };
}

$httpClient.get({ url: API, timeout: 8 }, (error, response, data) => {
  if (error || !data) {
    $done({
      title: "恐懼貪婪指數",
      content: "取得資料失敗，請稍後再試",
      icon: "gauge",
      "icon-color": "#9aa1ad"
    });
    return;
  }

  try {
    const list = JSON.parse(data).data;
    const today = parseInt(list[0].value, 10);
    const yesterday = list[1] ? parseInt(list[1].value, 10) : null;
    const m = mood(today);

    const lines = [`今日：${today} · ${m.label} ${m.emoji}`];
    if (yesterday !== null) {
      const diff = today - yesterday;
      const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "—";
      lines.push(`昨日：${yesterday} · ${mood(yesterday).label}（${arrow}${Math.abs(diff)}）`);
    }
    if (today <= 20) lines.push("提醒：極度恐懼常是別人恐懼我貪婪的功課時間");
    if (today > 80) lines.push("提醒：極度貪婪時管好倉位，別追高");

    $done({
      title: `Fear & Greed ${m.emoji} ${today}`,
      content: lines.join("\n"),
      icon: "gauge",
      "icon-color": m.color
    });
  } catch (e) {
    $done({
      title: "恐懼貪婪指數",
      content: "資料解析失敗：" + e.message,
      icon: "exclamationmark.triangle",
      "icon-color": "#f39c12"
    });
  }
});
