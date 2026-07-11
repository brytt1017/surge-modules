/**
 * Network Info Panel for Surge
 * 顯示目前出口 IP、ISP、所在地區
 * 資料來源：ip-api.com（免金鑰）
 * MIT License · Mingliang Lab
 */

const API = "http://ip-api.com/json/?fields=status,query,isp,country,regionName,city";

$httpClient.get({ url: API, timeout: 8 }, (error, response, data) => {
  if (error || !data) {
    $done({
      title: "Network Info",
      content: "取得網路資訊失敗",
      icon: "wifi.exclamationmark",
      "icon-color": "#e74c3c"
    });
    return;
  }

  try {
    const info = JSON.parse(data);
    if (info.status !== "success") throw new Error("查詢失敗");

    const wifi = (typeof $network !== "undefined" && $network["wifi"]?.ssid) || null;
    const lines = [
      "IP: " + info.query,
      "ISP: " + info.isp,
      "位置: " + [info.country, info.regionName, info.city].filter(Boolean).join(" · ")
    ];
    if (wifi) lines.unshift("Wi-Fi: " + wifi);

    $done({
      title: "Network Info",
      content: lines.join("\n"),
      icon: "network",
      "icon-color": "#4f8cff"
    });
  } catch (e) {
    $done({
      title: "Network Info",
      content: "資料解析失敗：" + e.message,
      icon: "exclamationmark.triangle",
      "icon-color": "#f39c12"
    });
  }
});
