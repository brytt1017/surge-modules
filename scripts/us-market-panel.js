/**
 * US Market Session Panel for Surge
 * 顯示美股目前所處時段（盤前／盤中／盤後／休市）、下一個轉換點倒數
 * 時區以紐約時間定義（自動處理夏令時間），台北時間由當下時差推算
 * 含 NYSE 休市日與提早收盤日（2026–2027），純本地計算、免 API、免 MitM
 * MIT License · Mingliang Lab
 */

// NYSE 休市日（YYYY-MM-DD，紐約當地日期）
const HOLIDAYS = new Set([
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
  "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31",
  "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24"
]);

// 提早收盤日（13:00 ET 收盤，盤後至 17:00）
const HALF_DAYS = new Set([
  "2026-11-27", "2026-12-24",
  "2027-11-26"
]);

const WD = ["日", "一", "二", "三", "四", "五", "六"];

// 一般日：盤前 04:00 / 開盤 09:30 / 收盤 16:00 / 盤後結束 20:00（分鐘制）
const PRE_OPEN = 4 * 60;
const REG_OPEN = 9 * 60 + 30;
const REG_CLOSE = 16 * 60;
const AFT_CLOSE = 20 * 60;
// 提早收盤日
const HALF_REG_CLOSE = 13 * 60;
const HALF_AFT_CLOSE = 17 * 60;

function nyParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short"
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    y: +get("year"), mo: +get("month"), d: +get("day"),
    h: +get("hour") % 24, mi: +get("minute"),
    wd: wdMap[get("weekday")]
  };
}

function tpeMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei", hour12: false, hour: "2-digit", minute: "2-digit"
  }).formatToParts(new Date());
  const get = t => +parts.find(p => p.type === t).value;
  return (get("hour") % 24) * 60 + get("minute");
}

function pad(n) { return String(n).padStart(2, "0"); }
function fmtMin(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }

function fmtDur(mins) {
  if (mins >= 1440) {
    const d = Math.floor(mins / 1440), h = Math.round((mins % 1440) / 60);
    return h ? `${d} 天 ${h} 小時` : `${d} 天`;
  }
  if (mins >= 60) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h} 小時 ${m} 分` : `${h} 小時`;
  }
  return `${mins} 分鐘`;
}

function dateKey(utcDate) {
  return utcDate.getUTCFullYear() + "-" + pad(utcDate.getUTCMonth() + 1) + "-" + pad(utcDate.getUTCDate());
}

function isTradingDay(key, wd) {
  return wd !== 0 && wd !== 6 && !HOLIDAYS.has(key);
}

try {
  const ny = nyParts();
  const nowMin = ny.h * 60 + ny.mi;
  const tpeMin = tpeMinutes();
  const offset = ((tpeMin - nowMin) % 1440 + 1440) % 1440; // 台北 − 紐約 時差（分鐘）
  const toTpe = m => fmtMin(m + offset);

  const half = HALF_DAYS.has(ny.date);
  const regClose = half ? HALF_REG_CLOSE : REG_CLOSE;
  const aftClose = half ? HALF_AFT_CLOSE : AFT_CLOSE;
  const today = isTradingDay(ny.date, ny.wd);

  let title, icon, color;
  const lines = [];

  if (today && nowMin >= PRE_OPEN && nowMin < aftClose) {
    let stage, until, nextLabel;
    if (nowMin < REG_OPEN) {
      stage = "🌅 盤前交易"; until = REG_OPEN; nextLabel = "距離開盤";
      icon = "sunrise.fill"; color = "#f39c12";
    } else if (nowMin < regClose) {
      stage = "🔔 盤中"; until = regClose; nextLabel = "距離收盤";
      icon = "chart.line.uptrend.xyaxis"; color = "#2ecc71";
    } else {
      stage = "🌙 盤後交易"; until = aftClose; nextLabel = "盤後結束尚有";
      icon = "moon.stars.fill"; color = "#4f8cff";
    }
    title = `美股 ${stage.slice(2).trim()}`;
    lines.push(`現在：${stage}${half ? "（提早收盤日）" : ""}`);
    lines.push(`${nextLabel}：${fmtDur(until - nowMin)}（${fmtMin(until)} ET／${toTpe(until)} 台北）`);
  } else {
    // 休市中：找下一個交易日
    icon = "moon.zzz.fill"; color = "#9aa1ad";
    title = "美股休市中";
    let reason = "已收盤";
    if (HOLIDAYS.has(ny.date)) reason = "今日為美股假日";
    else if (ny.wd === 0 || ny.wd === 6) reason = "週末休市";
    lines.push(`現在：😴 ${reason}`);

    let cursor = new Date(Date.UTC(ny.y, ny.mo - 1, ny.d));
    let dayOffset = 0;
    // 今天已過盤後（或非交易日）→ 從明天開始找
    if (!today || nowMin >= aftClose) {
      do {
        cursor = new Date(cursor.getTime() + 86400000);
        dayOffset++;
      } while (!isTradingDay(dateKey(cursor), cursor.getUTCDay()));
    }
    const nextKey = dateKey(cursor);
    const nextHalf = HALF_DAYS.has(nextKey);
    const mins = dayOffset === 0
      ? REG_OPEN - nowMin
      : (1440 - nowMin) + (dayOffset - 1) * 1440 + REG_OPEN;
    const preMins = dayOffset === 0
      ? PRE_OPEN - nowMin
      : (1440 - nowMin) + (dayOffset - 1) * 1440 + PRE_OPEN;

    lines.push(`下次開盤：${nextKey.slice(5).replace("-", "/")}（週${WD[cursor.getUTCDay()]}）${fmtMin(REG_OPEN)} ET／${toTpe(REG_OPEN)} 台北`);
    lines.push(`倒數：正股 ${fmtDur(Math.max(mins, 0))}・盤前 ${fmtDur(Math.max(preMins, 0))}`);
    if (nextHalf) lines.push("提醒：下個交易日提早於 13:00 ET 收盤");
  }

  lines.push(`紐約 ${pad(ny.h)}:${pad(ny.mi)}（週${WD[ny.wd]}）· 台北 ${fmtMin(tpeMin)}`);

  $done({ title, content: lines.join("\n"), icon, "icon-color": color });
} catch (e) {
  $done({
    title: "美股時段面板",
    content: "計算失敗：" + e.message,
    icon: "exclamationmark.triangle",
    "icon-color": "#f39c12"
  });
}
