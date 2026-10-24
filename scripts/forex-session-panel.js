/**
 * Forex Session Panel for Surge
 * 顯示雪梨／東京／倫敦／紐約四大外匯時段的開盤狀態與重疊時段
 * 各時段以當地時間定義（Intl 自動處理夏令時間），另顯示台北時間
 * 外匯週末休市：紐約時間週五 17:00 至週日 17:00
 * MIT License · Mingliang Lab
 */

// 各市場當地時間的常用交易時段（分鐘制）
const SESSIONS = [
  { name: "雪梨", emoji: "🦘", tz: "Australia/Sydney", start: 7 * 60, end: 16 * 60 },
  { name: "東京", emoji: "🗼", tz: "Asia/Tokyo", start: 9 * 60, end: 18 * 60 },
  { name: "倫敦", emoji: "🇬🇧", tz: "Europe/London", start: 8 * 60, end: 17 * 60 },
  { name: "紐約", emoji: "🗽", tz: "America/New_York", start: 8 * 60, end: 17 * 60 }
];

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function localParts(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit"
    }).formatToParts(new Date());
    const val = t => parts.find(p => p.type === t).value;
    return {
      day: WEEKDAYS[val("weekday")],
      min: (parseInt(val("hour"), 10) % 24) * 60 + parseInt(val("minute"), 10)
    };
  } catch (e) {
    // 舊環境 fallback：以固定 UTC 偏移近似（不含夏令時間）
    const offsets = {
      "Australia/Sydney": 10, "Asia/Tokyo": 9, "Europe/London": 0,
      "America/New_York": -5, "Asia/Taipei": 8
    };
    const d = new Date(Date.now() + (offsets[tz] || 0) * 3600 * 1000);
    return { day: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
}

function fmt(min) {
  return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
}

function fmtDur(mins) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h} 小時 ${m} 分` : `${h} 小時`;
  }
  return `${mins} 分鐘`;
}

const ny = localParts("America/New_York");
const tpe = localParts("Asia/Taipei");

// 週末休市判斷（紐約時間）：週六全天、週五 17:00 後、週日 17:00 前
const closed =
  ny.day === 6 ||
  (ny.day === 5 && ny.min >= 17 * 60) ||
  (ny.day === 0 && ny.min < 17 * 60);

if (closed) {
  $done({
    title: "外匯休市中 😴",
    content: `週末休市，紐約時間週日 17:00 重新開盤\n台北 ${fmt(tpe.min)} · 紐約 ${fmt(ny.min)}`,
    icon: "moon.zzz.fill",
    "icon-color": "#9aa1ad"
  });
} else {
  const open = SESSIONS.filter(s => {
    const t = localParts(s.tz).min;
    return t >= s.start && t < s.end;
  });
  const names = open.map(s => s.name);
  const has = n => names.includes(n);

  const lines = [];
  lines.push(
    open.length
      ? "開盤中：" + open.map(s => `${s.emoji}${s.name}`).join(" ")
      : "開盤中：無主要時段（流動性偏低）"
  );

  // 重疊時段提示
  if (has("倫敦") && has("紐約")) {
    lines.push("🔥 倫敦＋紐約重疊：流動性與波動最高");
  } else if (has("東京") && has("倫敦")) {
    lines.push("東京＋倫敦短暫重疊");
  } else if (has("雪梨") && has("東京")) {
    lines.push("雪梨＋東京重疊（亞洲盤）");
  }

  // 下一個開盤的時段
  let next = null, minDelta = Infinity;
  for (const s of SESSIONS) {
    if (names.includes(s.name)) continue;
    let delta = s.start - localParts(s.tz).min;
    if (delta <= 0) delta += 24 * 60;
    if (delta < minDelta) { minDelta = delta; next = s; }
  }
  if (next) lines.push(`下一個：${next.emoji}${next.name}（${fmtDur(minDelta)} 後開盤）`);
  lines.push(`台北 ${fmt(tpe.min)} · 紐約 ${fmt(ny.min)}`);

  const hot = has("倫敦") && has("紐約");
  $done({
    title: hot ? "外匯時段 🔥 重疊中" : "外匯時段面板",
    content: lines.join("\n"),
    icon: open.length ? "chart.line.uptrend.xyaxis" : "clock",
    "icon-color": hot ? "#e74c3c" : open.length ? "#2ecc71" : "#9aa1ad"
  });
}
