"use strict";
/* render.js — draws both panels from offscreen scene renders, then overlays
   found markers, the hint pulse, wrong-click flashes, the keyboard cursor,
   and the magnifier lens. */
window.STD = window.STD || {};

STD.render = {
  leftBase: null,   /* offscreen canvas: scene without differences */
  rightBase: null,  /* offscreen canvas: scene with all differences applied */
  leftCtx: null,
  rightCtx: null,
  lensCanvas: null,
  lensCtx: null,

  initCanvases: function () {
    STD.render.leftCtx = document.getElementById("panel-left").getContext("2d");
    STD.render.rightCtx = document.getElementById("panel-right").getContext("2d");
    STD.render.lensCanvas = document.getElementById("lens-canvas");
    STD.render.lensCtx = STD.render.lensCanvas.getContext("2d");
  },

  /* Renders the current scene twice into offscreen canvases: plain and changed. */
  renderSceneBases: function (sceneIndex) {
    var painter = STD.SCENE_PAINTERS[sceneIndex];
    var diffs = STD.SCENE_DIFFERENCES[sceneIndex].differences;
    var allIds = new Set(diffs.map(function (d) { return d.id; }));

    STD.render.leftBase = document.createElement("canvas");
    STD.render.leftBase.width = STD.PANEL_W; STD.render.leftBase.height = STD.PANEL_H;
    painter(STD.render.leftBase.getContext("2d"), new Set());

    STD.render.rightBase = document.createElement("canvas");
    STD.render.rightBase.width = STD.PANEL_W; STD.render.rightBase.height = STD.PANEL_H;
    painter(STD.render.rightBase.getContext("2d"), allIds);
  },

  drawFoundMarker: function (ctx, diff) {
    ctx.save();
    ctx.strokeStyle = "#2e9e57"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, diff.r * 0.82, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, diff.r * 0.82 + 3.4, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },

  drawHintPulse: function (ctx, diff, phase) {
    ctx.save();
    var radius = diff.r * (0.7 + 0.55 * phase);
    ctx.globalAlpha = 1 - phase * 0.75;
    ctx.strokeStyle = "#ffd94d"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#ffd94d";
    ctx.beginPath(); ctx.arc(diff.x, diff.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },

  drawWrongFlash: function (ctx, x, y, age) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - age);
    ctx.strokeStyle = "#e33f3f"; ctx.lineWidth = 4; ctx.lineCap = "round";
    var s = 10;
    ctx.beginPath();
    ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
    ctx.stroke(); ctx.restore();
  },

  drawKeyboardCursor: function (ctx, cursor) {
    ctx.save();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },

  /* Full redraw of both visible panels from game state. */
  drawPanels: function (state, nowMs) {
    var pairs = [
      { ctx: STD.render.leftCtx, base: STD.render.leftBase },
      { ctx: STD.render.rightCtx, base: STD.render.rightBase }
    ];
    for (var p = 0; p < pairs.length; p++) {
      var ctx = pairs[p].ctx;
      ctx.drawImage(pairs[p].base, 0, 0);
      var diffs = STD.SCENE_DIFFERENCES[state.sceneIndex].differences;
      for (var i = 0; i < diffs.length; i++) {
        if (state.found.has(diffs[i].id)) STD.render.drawFoundMarker(ctx, diffs[i]);
      }
      if (state.hintTarget && nowMs < state.hintUntil) {
        var phase = ((nowMs - state.hintStart) % 700) / 700;
        STD.render.drawHintPulse(ctx, state.hintTarget, phase);
      }
      for (var w = 0; w < state.wrongFlashes.length; w++) {
        var flash = state.wrongFlashes[w];
        var age = (nowMs - flash.at) / 650;
        if (age < 1) STD.render.drawWrongFlash(ctx, flash.x, flash.y, age);
      }
      if (state.keyboardMode) STD.render.drawKeyboardCursor(ctx, state.cursor);
    }
  },

  /* Positions and paints the magnifier lens over the hovered panel. */
  drawLens: function (panelCanvas, base, point, stageEl) {
    var lens = STD.render.lensCanvas;
    var ctx = STD.render.lensCtx;
    var size = lens.width, zoom = 2.1, src = size / zoom;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(base, point.x - src / 2, point.y - src / 2, src, src, 0, 0, size, size);
    ctx.restore();

    var panelRect = panelCanvas.getBoundingClientRect();
    var stageRect = stageEl.getBoundingClientRect();
    var scaleX = panelRect.width / STD.PANEL_W;
    var scaleY = panelRect.height / STD.PANEL_H;
    lens.style.left = (panelRect.left - stageRect.left + point.x * scaleX - size / 2) + "px";
    lens.style.top = (panelRect.top - stageRect.top + point.y * scaleY - size / 2) + "px";
    lens.hidden = false;
  },

  hideLens: function () { STD.render.lensCanvas.hidden = true; }
};
