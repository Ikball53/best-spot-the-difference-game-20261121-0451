"use strict";
/* scenes.js — paints the three original scenes with Canvas 2D.
   Every painter takes (ctx, active): active is a Set of difference ids to apply.
   The left panel paints with an empty set; the right panel with the full set. */
window.STD = window.STD || {};

/* ---------- small drawing helpers ---------- */

function skyGradient(ctx, top, mid, bottom) {
  var g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 560, 420);
}

function drawSun(ctx, x, y, r, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(x, y, r * 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCloud(ctx, x, y, s, colour) {
  ctx.save(); ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y + 3 * s, 12 * s, 0, Math.PI * 2);
  ctx.arc(x - 20 * s, y + 4 * s, 11 * s, 0, Math.PI * 2);
  ctx.arc(x + 4 * s, y - 8 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill(); ctx.restore();
}

function drawGull(ctx, x, y, s) {
  ctx.save(); ctx.strokeStyle = "#33506b"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 10 * s, y);
  ctx.stroke(); ctx.restore();
}

function drawCrate(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#a9743f"; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#7c5227"; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
  ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
  ctx.stroke(); ctx.restore();
}

function drawBarrel(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#8a5a33";
  ctx.beginPath();
  ctx.moveTo(x + 3, y); ctx.lineTo(x + w - 3, y);
  ctx.quadraticCurveTo(x + w + 3, y + h / 2, x + w - 3, y + h);
  ctx.lineTo(x + 3, y + h);
  ctx.quadraticCurveTo(x - 3, y + h / 2, x + 3, y);
  ctx.fill();
  ctx.strokeStyle = "#5e3c1f"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + h * 0.3); ctx.lineTo(x + w - 1, y + h * 0.3);
  ctx.moveTo(x + 1, y + h * 0.7); ctx.lineTo(x + w - 1, y + h * 0.7);
  ctx.stroke(); ctx.restore();
}

function drawLanternPost(ctx, x, topY, baseY, lampColour) {
  ctx.save();
  ctx.fillStyle = "#3c4a59"; ctx.fillRect(x - 3, topY, 6, baseY - topY);
  ctx.fillStyle = "#2c3846"; ctx.fillRect(x - 11, topY - 16, 22, 6);
  ctx.fillStyle = lampColour;
  ctx.beginPath(); ctx.arc(x, topY - 2, 8, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.22;
  ctx.beginPath(); ctx.arc(x, topY - 2, 17, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCottage(ctx, x, y, w, h, wall, roof, litWindow) {
  ctx.save();
  ctx.fillStyle = wall; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - 8, y); ctx.lineTo(x + w / 2, y - h * 0.55); ctx.lineTo(x + w + 8, y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#5b4232"; ctx.fillRect(x + w * 0.42, y + h * 0.42, w * 0.18, h * 0.58);
  ctx.fillStyle = litWindow ? "#ffd94d" : "#bcd9ea";
  ctx.fillRect(x + w * 0.12, y + h * 0.22, w * 0.2, h * 0.26);
  ctx.fillStyle = "#bcd9ea";
  ctx.fillRect(x + w * 0.68, y + h * 0.22, w * 0.2, h * 0.26);
  ctx.restore();
}

function drawSailboat(ctx, x, y, striped) {
  ctx.save();
  ctx.strokeStyle = "#6b4a2b"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y - 58); ctx.lineTo(x, y + 6); ctx.stroke();
  ctx.fillStyle = "#f6f1e3";
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 56); ctx.lineTo(x + 3, y + 2); ctx.lineTo(x + 38, y + 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#e8ddc4";
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 48); ctx.lineTo(x - 3, y + 2); ctx.lineTo(x - 28, y + 2);
  ctx.closePath(); ctx.fill();
  if (striped) {
    ctx.fillStyle = "#d94f4f";
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 30); ctx.lineTo(x + 3, y - 18); ctx.lineTo(x + 22, y - 18);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = "#8a4b2d";
  ctx.beginPath();
  ctx.moveTo(x - 34, y + 6); ctx.lineTo(x + 42, y + 6); ctx.lineTo(x + 32, y + 20); ctx.lineTo(x - 24, y + 20);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawFishingBoat(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#3f6d8e";
  ctx.beginPath();
  ctx.moveTo(x - 40, y); ctx.lineTo(x + 44, y); ctx.lineTo(x + 34, y + 16); ctx.lineTo(x - 30, y + 16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f2ede0"; ctx.fillRect(x - 8, y - 20, 24, 20);
  ctx.fillStyle = "#bcd9ea"; ctx.fillRect(x - 3, y - 15, 8, 8); ctx.fillRect(x + 8, y - 15, 6, 8);
  ctx.strokeStyle = "#6b4a2b"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 26, y); ctx.lineTo(x + 26, y - 26); ctx.stroke();
  ctx.fillStyle = "#d94f4f"; ctx.fillRect(x + 26, y - 26, 12, 7);
  ctx.restore();
}

function drawBuoy(ctx, x, y, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 8); ctx.lineTo(x, y - 12); ctx.lineTo(x + 10, y + 8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f6f1e3"; ctx.fillRect(x - 7, y - 1, 14, 4);
  ctx.restore();
}

function drawLighthouse(ctx, x, baseY) {
  ctx.save();
  ctx.fillStyle = "#5b6672";
  ctx.beginPath();
  ctx.moveTo(x - 26, baseY); ctx.lineTo(x + 30, baseY); ctx.lineTo(x + 18, baseY - 16); ctx.lineTo(x - 14, baseY - 16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f2ede0"; ctx.fillRect(x - 11, baseY - 78, 22, 62);
  ctx.fillStyle = "#d94f4f";
  ctx.fillRect(x - 11, baseY - 62, 22, 10); ctx.fillRect(x - 11, baseY - 40, 22, 10);
  ctx.fillStyle = "#2c3846"; ctx.fillRect(x - 13, baseY - 88, 26, 10);
  ctx.fillStyle = "#ffd94d"; ctx.fillRect(x - 7, baseY - 84, 14, 8);
  ctx.restore();
}

/* ---------- Scene 1: Harbour Dawn ---------- */

STD.paintHarbourScene = function (ctx, active) {
  skyGradient(ctx, "#7fb2dd", "#f6c98b", "#f9e3b8");
  drawSun(ctx, 486, 58, 24, "#ffdf6b");
  drawCloud(ctx, 206, 48, 1.0, "rgba(255,255,255,0.92)");
  drawCloud(ctx, 332, 80, 0.8, "rgba(255,255,255,0.85)");
  if (active.has("extra-cloud")) drawCloud(ctx, 96, 62, 0.85, "rgba(255,255,255,0.92)");

  drawGull(ctx, 382, 58, 1.0); drawGull(ctx, 298, 108, 0.8); drawGull(ctx, 352, 128, 0.65);
  if (active.has("extra-gull")) drawGull(ctx, 430, 84, 0.9);

  /* distant hills */
  ctx.fillStyle = "#8fa8a0";
  ctx.beginPath();
  ctx.moveTo(0, 196); ctx.quadraticCurveTo(120, 148, 250, 188);
  ctx.quadraticCurveTo(380, 150, 560, 192); ctx.lineTo(560, 240); ctx.lineTo(0, 240);
  ctx.closePath(); ctx.fill();

  /* shore cottages */
  drawCottage(ctx, 252, 176, 62, 52, "#f3e6cf", "#a34d3f", false);
  drawCottage(ctx, 300, 182, 56, 46, "#e8d9bd", "#7a5b8f", active.has("lit-window"));
  drawCottage(ctx, 348, 178, 58, 50, "#efe0c8", "#4f7a5b", false);
  ctx.fillStyle = "#cbb489"; ctx.fillRect(0, 226, 560, 12);

  drawLighthouse(ctx, 506, 232);

  /* sea */
  var sea = ctx.createLinearGradient(0, 238, 0, 345);
  sea.addColorStop(0, "#5e97bd"); sea.addColorStop(1, "#3d6f96");
  ctx.fillStyle = sea; ctx.fillRect(0, 238, 560, 108);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2; ctx.lineCap = "round";
  var waves = [[40, 262], [120, 292], [210, 258], [300, 300], [390, 268], [470, 300], [80, 322], [430, 326]];
  for (var i = 0; i < waves.length; i++) {
    ctx.beginPath();
    ctx.moveTo(waves[i][0], waves[i][1]);
    ctx.quadraticCurveTo(waves[i][0] + 12, waves[i][1] - 5, waves[i][0] + 24, waves[i][1]);
    ctx.stroke();
  }
  /* sun glitter path */
  ctx.fillStyle = "rgba(255,223,107,0.35)";
  for (var gy = 248; gy < 335; gy += 12) ctx.fillRect(462 + ((gy * 7) % 26), gy, 20, 3);

  drawSailboat(ctx, 150, 272, active.has("sail-stripe"));
  drawFishingBoat(ctx, 344, 282);
  drawBuoy(ctx, 268, 316, active.has("buoy-green") ? "#3fae6a" : "#d94f4f");

  /* dock */
  ctx.fillStyle = "#8a6844"; ctx.fillRect(0, 342, 560, 78);
  ctx.strokeStyle = "#6f5334"; ctx.lineWidth = 2;
  for (var px = 0; px <= 560; px += 56) { ctx.beginPath(); ctx.moveTo(px, 342); ctx.lineTo(px, 420); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, 380); ctx.lineTo(560, 380); ctx.stroke();
  ctx.fillStyle = "#5e4630";
  ctx.fillRect(24, 330, 10, 22); ctx.fillRect(528, 330, 10, 22);

  drawLanternPost(ctx, 66, 254, 346, active.has("lantern-teal") ? "#2fd4c4" : "#ffb347");
  drawLanternPost(ctx, 496, 254, 346, "#ffb347");

  drawCrate(ctx, 408, 344, 40, 34);
  if (!active.has("missing-crate")) drawCrate(ctx, 432, 340, 40, 34);
  drawBarrel(ctx, 96, 348, 30, 44);
  drawBarrel(ctx, 130, 356, 26, 36);
  /* coiled rope */
  ctx.strokeStyle = "#c9b083"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(300, 384, 16, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(300, 384, 8, 0, Math.PI * 2); ctx.stroke();
};

/* ---------- Scene 2: Garden Lane ---------- */

function drawTree(ctx, x, baseY, appleCount) {
  ctx.save();
  ctx.fillStyle = "#7a5230"; ctx.fillRect(x - 8, baseY - 92, 16, 92);
  ctx.fillStyle = "#5b8f4e";
  ctx.beginPath();
  ctx.arc(x, baseY - 118, 52, 0, Math.PI * 2);
  ctx.arc(x - 38, baseY - 96, 34, 0, Math.PI * 2);
  ctx.arc(x + 38, baseY - 96, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d94f4f";
  var spots = [[-26, -128], [8, -140], [30, -112], [-8, -106], [18, -96], [-34, -104], [2, -122], [40, -130]];
  for (var i = 0; i < appleCount && i < spots.length; i++) {
    ctx.beginPath(); ctx.arc(x + spots[i][0], baseY + spots[i][1], 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawTulip(ctx, x, y, colour) {
  ctx.save();
  ctx.strokeStyle = "#4e7a3f"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 18); ctx.stroke();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 18); ctx.lineTo(x - 6, y - 28); ctx.lineTo(x - 2, y - 22);
  ctx.lineTo(x, y - 29); ctx.lineTo(x + 2, y - 22); ctx.lineTo(x + 6, y - 28); ctx.lineTo(x + 6, y - 18);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawButterfly(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#b07fe8";
  ctx.beginPath(); ctx.ellipse(x - 8, y - 4, 8, 5, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 8, y - 4, 8, 5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - 6, y + 4, 6, 4, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 6, y + 4, 6, 4, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a2b4f"; ctx.fillRect(x - 1.5, y - 7, 3, 14);
  ctx.restore();
}

function drawMushroom(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#f2ede0"; ctx.fillRect(x - 4, y - 8, 8, 10);
  ctx.fillStyle = "#d94f4f";
  ctx.beginPath(); ctx.arc(x, y - 8, 11, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - 4, y - 13, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 4, y - 11, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

STD.paintGardenScene = function (ctx, active) {
  skyGradient(ctx, "#8ec9ee", "#cdeffb", "#eafbe7");
  drawSun(ctx, 502, 54, 22, "#ffd94d");
  drawCloud(ctx, 110, 52, 0.95, "rgba(255,255,255,0.95)");
  drawCloud(ctx, 330, 40, 0.75, "rgba(255,255,255,0.9)");
  drawGull(ctx, 210, 84, 0.8);

  /* lawn */
  ctx.fillStyle = "#7cbf62"; ctx.fillRect(0, 288, 560, 132);
  ctx.fillStyle = "#6cae54"; ctx.fillRect(0, 288, 560, 10);

  /* cottage with curtained window */
  ctx.fillStyle = "#f6ecd7"; ctx.fillRect(176, 176, 128, 112);
  ctx.fillStyle = "#a34d3f";
  ctx.beginPath();
  ctx.moveTo(164, 178); ctx.lineTo(240, 118); ctx.lineTo(316, 178); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8a8f96"; ctx.fillRect(278, 128, 16, 34);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath(); ctx.arc(288, 116, 7, 0, Math.PI * 2); ctx.arc(294, 104, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6b4a2b"; ctx.fillRect(228, 228, 26, 60);
  ctx.fillStyle = "#ffd94d"; ctx.beginPath(); ctx.arc(248, 260, 3, 0, Math.PI * 2); ctx.fill();
  /* window with curtains at (238,206) */
  ctx.fillStyle = "#bcd9ea"; ctx.fillRect(218, 192, 40, 30);
  ctx.fillStyle = active.has("curtain-colour") ? "#7fb2dd" : "#e88bb0";
  ctx.fillRect(218, 192, 12, 30); ctx.fillRect(246, 192, 12, 30);
  ctx.strokeStyle = "#6b4a2b"; ctx.lineWidth = 2; ctx.strokeRect(218, 192, 40, 30);
  ctx.fillStyle = "#bcd9ea"; ctx.fillRect(268, 200, 24, 22);
  ctx.strokeRect(268, 200, 24, 22);

  /* birdhouse on pole */
  ctx.fillStyle = "#7a5230"; ctx.fillRect(93, 184, 6, 104);
  ctx.fillStyle = "#e8b04b"; ctx.fillRect(80, 158, 32, 28);
  ctx.fillStyle = active.has("birdhouse-roof") ? "#4f7a5b" : "#a34d3f";
  ctx.beginPath();
  ctx.moveTo(76, 160); ctx.lineTo(96, 142); ctx.lineTo(116, 160); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a2b1f"; ctx.beginPath(); ctx.arc(96, 170, 5, 0, Math.PI * 2); ctx.fill();

  drawTree(ctx, 452, 292, active.has("apple-count") ? 4 : 8);

  /* fence */
  ctx.fillStyle = "#c9a06b";
  for (var fx = 8; fx < 560; fx += 34) ctx.fillRect(fx, 300, 9, 42);
  ctx.fillRect(0, 308, 560, 7); ctx.fillRect(0, 326, 560, 7);

  /* stepping-stone path */
  ctx.fillStyle = "#b9bec4";
  var stones = [[262, 312], [292, 336], [322, 360], [300, 388], [340, 402]];
  for (var si = 0; si < stones.length; si++) {
    if (active.has("missing-stone") && si === 2) continue;
    ctx.beginPath();
    ctx.ellipse(stones[si][0], stones[si][1], 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* tulip bed */
  ctx.fillStyle = "#8a6844"; ctx.fillRect(84, 344, 96, 14);
  var tulipColour = active.has("tulip-colour") ? "#f2b134" : "#e85d75";
  for (var tx = 96; tx <= 168; tx += 18) drawTulip(ctx, tx, 346, tulipColour);

  /* watering can */
  ctx.save();
  ctx.fillStyle = active.has("can-colour") ? "#4f8fd9" : "#3fae6a";
  ctx.fillRect(184, 338, 26, 20);
  ctx.beginPath();
  ctx.moveTo(184, 344); ctx.lineTo(170, 336); ctx.lineTo(172, 344); ctx.lineTo(184, 352);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = active.has("can-colour") ? "#3a6da8" : "#2e7d4f"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(197, 338, 9, Math.PI, 0); ctx.stroke();
  ctx.restore();

  /* flower dots + grass tufts */
  ctx.fillStyle = "#fff";
  var dots = [[60, 392], [150, 404], [390, 398], [500, 384], [240, 404]];
  for (var di = 0; di < dots.length; di++) { ctx.beginPath(); ctx.arc(dots[di][0], dots[di][1], 3.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = "#4e7a3f"; ctx.lineWidth = 2;
  var tufts = [[40, 368], [210, 380], [470, 404], [520, 360]];
  for (var ti = 0; ti < tufts.length; ti++) {
    ctx.beginPath();
    ctx.moveTo(tufts[ti][0], tufts[ti][1]); ctx.lineTo(tufts[ti][0] - 4, tufts[ti][1] - 10);
    ctx.moveTo(tufts[ti][0] + 5, tufts[ti][1]); ctx.lineTo(tufts[ti][0] + 8, tufts[ti][1] - 11);
    ctx.stroke();
  }

  drawMushroom(ctx, 386, 372);
  if (active.has("extra-mushroom")) drawMushroom(ctx, 408, 366);
  if (active.has("butterfly")) drawButterfly(ctx, 300, 120);
};

/* ---------- Scene 3: Market Dusk ---------- */

function drawStall(ctx, x, y, w, awningA, awningB) {
  ctx.save();
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(x + 6, y + 34, 7, 86); ctx.fillRect(x + w - 13, y + 34, 7, 86);
  ctx.fillStyle = "#a9743f"; ctx.fillRect(x, y + 108, w, 14);
  for (var i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? awningA : awningB;
    ctx.beginPath();
    ctx.moveTo(x + (w / 6) * i, y + 34);
    ctx.lineTo(x + (w / 6) * i + 8, y);
    ctx.lineTo(x + (w / 6) * (i + 1) + 8, y);
    ctx.lineTo(x + (w / 6) * (i + 1), y + 34);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawFruitCrate(ctx, x, y, fruitColour) {
  drawCrate(ctx, x, y, 52, 34);
  ctx.save(); ctx.fillStyle = fruitColour;
  var spots = [[10, -4], [22, -7], [34, -4], [16, -12], [28, -13]];
  for (var i = 0; i < spots.length; i++) {
    ctx.beginPath(); ctx.arc(x + spots[i][0], y + spots[i][1], 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawCat(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#3a3f47";
  ctx.beginPath(); ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 13, y - 9, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 7, y - 14); ctx.lineTo(x + 9, y - 21); ctx.lineTo(x + 13, y - 15);
  ctx.moveTo(x + 15, y - 15); ctx.lineTo(x + 19, y - 21); ctx.lineTo(x + 20, y - 13);
  ctx.fill();
  ctx.strokeStyle = "#3a3f47"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x - 15, y - 2); ctx.quadraticCurveTo(x - 26, y - 8, x - 22, y - 18); ctx.stroke();
  ctx.fillStyle = "#ffd94d";
  ctx.beginPath(); ctx.arc(x + 16, y - 10, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

STD.paintMarketScene = function (ctx, active) {
  skyGradient(ctx, "#4a3f78", "#b85c7a", "#f2a65a");
  drawSun(ctx, 70, 250, 30, "#ff9d5c");
  drawCloud(ctx, 150, 46, 0.8, "rgba(90,70,120,0.8)");
  drawCloud(ctx, 440, 38, 0.9, "rgba(90,70,120,0.8)");

  /* rooftops silhouette */
  ctx.fillStyle = "#3c3358";
  ctx.beginPath();
  ctx.moveTo(0, 210); ctx.lineTo(0, 150); ctx.lineTo(60, 118); ctx.lineTo(130, 150);
  ctx.lineTo(200, 132); ctx.lineTo(270, 158); ctx.lineTo(340, 128); ctx.lineTo(420, 156);
  ctx.lineTo(490, 124); ctx.lineTo(560, 152); ctx.lineTo(560, 210);
  ctx.closePath(); ctx.fill();

  /* clock tower */
  ctx.fillStyle = "#57497e"; ctx.fillRect(278, 66, 44, 130);
  ctx.fillStyle = "#3c3358";
  ctx.beginPath();
  ctx.moveTo(272, 68); ctx.lineTo(300, 36); ctx.lineTo(328, 68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f6ecd7";
  ctx.beginPath(); ctx.arc(300, 84, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3a2b1f"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(300, 84); ctx.lineTo(300, 72);
  if (active.has("clock-hands")) { ctx.moveTo(300, 84); ctx.lineTo(292, 90); }
  else { ctx.moveTo(300, 84); ctx.lineTo(310, 88); }
  ctx.stroke();

  /* string of lanterns */
  ctx.strokeStyle = "rgba(30,24,48,0.9)"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 66); ctx.quadraticCurveTo(280, 118, 560, 60); ctx.stroke();
  var lanternXs = [52, 132, 214, 300, 392, 468, 528];
  var lanternColours = ["#ffb347", "#ff7a7a", "#ffd94d", "#7ae0a3", "#ffb347", "#ff9de2", "#ffd94d"];
  for (var li = 0; li < lanternXs.length; li++) {
    if (active.has("missing-lantern") && lanternXs[li] === 392) continue;
    var lx = lanternXs[li];
    var ly = 66 + Math.sin((lx / 560) * Math.PI) * 26 + 8;
    ctx.strokeStyle = "rgba(30,24,48,0.9)";
    ctx.beginPath(); ctx.moveTo(lx, ly - 12); ctx.lineTo(lx, ly); ctx.stroke();
    ctx.fillStyle = lanternColours[li];
    ctx.beginPath(); ctx.ellipse(lx, ly + 8, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(lx, ly + 8, 16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ground */
  ctx.fillStyle = "#6b5560"; ctx.fillRect(0, 330, 560, 90);
  ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 2;
  for (var gx2 = 0; gx2 <= 560; gx2 += 70) { ctx.beginPath(); ctx.moveTo(gx2, 330); ctx.lineTo(gx2 - 14, 420); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, 372); ctx.lineTo(560, 372); ctx.stroke();

  /* stalls */
  drawStall(ctx, 62, 118, 156, active.has("awning-stripe") ? "#3f8fd9" : "#d94f4f", "#f6f1e3");
  drawStall(ctx, 238, 132, 140, "#3fae6a", "#f6f1e3");
  drawStall(ctx, 398, 122, 140, "#e8a13c", "#f6f1e3");

  /* shop sign with a letter */
  ctx.fillStyle = "#f6ecd7"; ctx.fillRect(428, 182, 48, 30);
  ctx.strokeStyle = "#7a5230"; ctx.lineWidth = 2; ctx.strokeRect(428, 182, 48, 30);
  ctx.fillStyle = "#a34d3f";
  ctx.font = "bold 20px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(active.has("sign-letter") ? "B" : "A", 452, 198);

  /* flag on the right stall */
  ctx.strokeStyle = "#3c3358"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(512, 150); ctx.lineTo(512, 96); ctx.stroke();
  ctx.fillStyle = active.has("flag-colour") ? "#3fae6a" : "#d94f4f";
  ctx.beginPath();
  ctx.moveTo(512, 98); ctx.lineTo(538, 106); ctx.lineTo(512, 116); ctx.closePath(); ctx.fill();

  /* goods */
  drawFruitCrate(ctx, 86, 250, "#e85d75");
  drawFruitCrate(ctx, 146, 250, "#f2b134");
  drawFruitCrate(ctx, 224, 264, active.has("fruit-swap") ? "#b07fe8" : "#ff8c42");
  drawFruitCrate(ctx, 286, 264, "#7ae0a3");
  drawFruitCrate(ctx, 422, 254, "#e85d75");

  drawCrate(ctx, 140, 330, 44, 34);
  if (!active.has("crate-count")) drawCrate(ctx, 146, 302, 44, 34);
  drawCrate(ctx, 330, 330, 52, 36);
  if (active.has("cat-on-crate")) drawCat(ctx, 356, 322);

  drawBarrel(ctx, 100, 316, 30, 46);
  if (active.has("extra-barrel")) drawBarrel(ctx, 56, 320, 30, 46);
  drawBarrel(ctx, 492, 318, 28, 44);

  /* hanging scale + jars on middle stall */
  ctx.strokeStyle = "#2c3846"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(308, 176); ctx.lineTo(308, 196); ctx.stroke();
  ctx.fillStyle = "#c9a13b";
  ctx.beginPath(); ctx.arc(308, 202, 9, 0, Math.PI); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#d9e6f2";
  ctx.fillRect(258, 226, 12, 18); ctx.fillRect(274, 226, 12, 18);
  ctx.fillStyle = "#a34d3f"; ctx.fillRect(258, 226, 12, 5); ctx.fillRect(274, 226, 12, 5);
};

/* Painters indexed by scene order. */
STD.SCENE_PAINTERS = [STD.paintHarbourScene, STD.paintGardenScene, STD.paintMarketScene];
