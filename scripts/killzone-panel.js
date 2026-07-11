/**
 * ICT Killzone Panel for Surge
 * 顯示目前所處的 ICT Killzone、剩餘時間與下一個時段
 * 時區以紐約時間定義（自動處理夏令時間），另顯示台北時間
 * MIT License · Mingliang Lab
 */

// Killzone 定義（紐約時間，分鐘制）
const KILLZONES = [
  { name: "亞洲盤 KZ", emoji: "🌏", start: 20 * 60, end: 24 * 60 },
  { name: "倫敦 KZ", emoji: "🇬🇧", start: 2 * 60, end: 5 * 60 },
  { name: "紐約 AM KZ", emoji: "🗽", start: 7 * 60, end: 10 * 60 },
  { name: "倫敦收盤 KZ", emoji: "🌇", start: 10 * 60, end: 12 * 60 },
  { name: "紐約 PM KZ", emoji: "🌆", start: 13 * 60 + 30, end: 16 * 60 }
];

function timeInZone(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false, hour: "2-digit", minute: "2-digit"
    }).formatToParts(new Date());
    const get = t => parseInt(parts.find(p => p.type === t).value, 10);
    return { h: get("hour") % 24, m: get("minute") };
  } catch (e) {
    // 舊環境 fallback：紐約以 UTC-4 近似
    const d = new Date();
    const utcH = d.getUTCHours(), utcM = d.getUTCMinutes();
    if (tz === "America/New_York") return { h: (utcH + 20) % 24, m: utcM };
    return { h: (utcH + 8) % 24, m: utcM };
  }
}

function fmt(t) {
  return String(t.h).padStart(2, "0") + ":" + String(t.m).padStart(2, "0");
}

function fmtDur(mins) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h} 小時 ${m} 分` : `${h} 小時`;
  }
  return `${mins} 分鐘`;
}

const ny = timeInZone("America/New_York");
const tpe = timeInZone("Asia/Taipei");
const nowMin = ny.h * 60 + ny.m;

let active = null;
for (const kz of KILLZONES) {
  if (nowMin >= kz.start && nowMin < kz.end) { active = kz; break; }
}

// 找下一個 killzone（含跨日）
let next = null, minDelta = Infinity;
for (const kz of KILLZONES) {
  let delta = kz.start - nowMin;
  if (delta <= 0) delta += 24 * 60;
  if (delta < minDelta) { minDelta = delta; next = kz; }
}

const lines = [];
if (active) {
  lines.push(`現在：${active.emoji} ${active.name}（剩 ${fmtDur(active.end - nowMin)}）`);
} else {
  lines.push("現在：😴 非 Killzone 時段");
}
lines.push(`下一個：${next.emoji} ${next.name}（${fmtDur(minDelta)} 後）`);
lines.push(`台北 ${fmt(tpe)} · 紐約 ${fmt(ny)}`);

$done({
  title: active ? `Killzone 進行中 ${active.emoji}` : "Killzone 面板",
  content: lines.join("\n"),
  icon: active ? "flame.fill" : "clock",
  "icon-color": active ? "#e74c3c" : "#9aa1ad"
});
