"use strict";
/* game.js — Twin Lanterns game flow: scene state, timer, marking, hints,
   scene transitions, win / time-up screens, and a ?demo=1 screenshot mode. */
window.STD = window.STD || {};

STD.game = {
  TIME_LIMIT_SECONDS: 150,
  HINTS_PER_SCENE: 3,
  WRONG_PENALTY_SECONDS: 2,

  state: null,
  timerHandle: null,
  frameHandle: null,

  freshState: function (sceneIndex) {
    return {
      sceneIndex: sceneIndex,
      found: new Set(),
      hintsLeft: STD.game.HINTS_PER_SCENE,
      secondsLeft: STD.game.TIME_LIMIT_SECONDS,
      misses: 0,
      finished: false,
      hintTarget: null,
      hintStart: 0,
      hintUntil: 0,
      wrongFlashes: [],
      keyboardMode: false,
      cursor: { x: STD.PANEL_W / 2, y: STD.PANEL_H / 2 },
      lensOn: false,
      totalElapsed: 0
    };
  },

  el: function (id) { return document.getElementById(id); },

  setStatus: function (text, kind) {
    var line = STD.game.el("status-line");
    line.textContent = text;
    line.className = kind || "";
  },

  formatClock: function (seconds) {
    var s = Math.max(0, Math.ceil(seconds));
    var m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  },

  refreshHud: function () {
    var state = STD.game.state;
    var scene = STD.SCENE_DIFFERENCES[state.sceneIndex];
    STD.game.el("hud-scene").textContent =
      "Scene " + (state.sceneIndex + 1) + " of " + STD.SCENE_DIFFERENCES.length + " · " + scene.sceneName;
    STD.game.el("found-count").textContent = String(state.found.size);
    STD.game.el("left-count").textContent = String(scene.differences.length - state.found.size);
    STD.game.el("hint-count").textContent = String(state.hintsLeft);
    STD.game.el("btn-hint").disabled = state.hintsLeft <= 0 || state.finished;
    var timer = STD.game.el("hud-timer");
    timer.textContent = STD.game.formatClock(state.secondsLeft);
    timer.className = state.secondsLeft <= 20 ? "overtime" : "";
    STD.game.el("btn-lens").textContent = "Lens: " + (state.lensOn ? "on" : "off");
    STD.game.el("btn-lens").className = state.lensOn ? "active" : "";
    STD.game.el("btn-sound").textContent = "Sound: " + (STD.audio.muted ? "off" : "on");
  },

  startScene: function (sceneIndex, carryElapsed) {
    var keepLens = STD.game.state ? STD.game.state.lensOn : false;
    STD.game.state = STD.game.freshState(sceneIndex);
    STD.game.state.lensOn = keepLens;
    STD.game.state.totalElapsed = carryElapsed || 0;
    STD.render.renderSceneBases(sceneIndex);
    STD.game.el("overlay").hidden = true;
    STD.game.setStatus("Find every difference between the two pictures. Click or tap one to mark it.");
    STD.game.refreshHud();
    STD.game.startTimer();
  },

  startTimer: function () {
    if (STD.game.timerHandle) clearInterval(STD.game.timerHandle);
    STD.game.timerHandle = setInterval(function () {
      var state = STD.game.state;
      if (!state || state.finished) return;
      state.secondsLeft -= 1;
      state.totalElapsed += 1;
      if (state.secondsLeft <= 0) {
        state.secondsLeft = 0;
        STD.game.onTimeUp();
      }
      STD.game.refreshHud();
    }, 1000);
  },

  startFrameLoop: function () {
    function frame(nowMs) {
      var state = STD.game.state;
      if (state) {
        state.wrongFlashes = state.wrongFlashes.filter(function (f) { return nowMs - f.at < 700; });
        STD.render.drawPanels(state, nowMs);
      }
      STD.game.frameHandle = requestAnimationFrame(frame);
    }
    STD.game.frameHandle = requestAnimationFrame(frame);
  },

  /* Core marking rule, shared by pointer clicks and the keyboard cursor. */
  attemptMark: function (point) {
    var state = STD.game.state;
    if (!state || state.finished) return;
    var diff = STD.findDifferenceAt(state.sceneIndex, point.x, point.y);
    if (diff && !state.found.has(diff.id)) {
      state.found.add(diff.id);
      STD.audio.playFindChime();
      var left = STD.SCENE_DIFFERENCES[state.sceneIndex].differences.length - state.found.size;
      STD.game.setStatus("Found: " + diff.label + ". " + left + " to go.", "good");
      if (state.hintTarget && state.hintTarget.id === diff.id) state.hintUntil = 0;
      STD.game.refreshHud();
      if (left === 0) STD.game.onSceneComplete();
    } else if (diff) {
      STD.game.setStatus("Already found that one — keep looking.", "");
    } else {
      state.misses += 1;
      state.secondsLeft = Math.max(0, state.secondsLeft - STD.game.WRONG_PENALTY_SECONDS);
      state.wrongFlashes.push({ x: point.x, y: point.y, at: performance.now() });
      STD.audio.playWrongBuzz();
      STD.game.setStatus("Not there — minus " + STD.game.WRONG_PENALTY_SECONDS + " seconds. Look again.", "bad");
      STD.game.refreshHud();
    }
  },

  useHint: function () {
    var state = STD.game.state;
    if (!state || state.finished || state.hintsLeft <= 0) return;
    var diffs = STD.SCENE_DIFFERENCES[state.sceneIndex].differences;
    var unfound = diffs.filter(function (d) { return !state.found.has(d.id); });
    if (!unfound.length) return;
    state.hintTarget = unfound[Math.floor(Math.random() * unfound.length)];
    state.hintStart = performance.now();
    state.hintUntil = state.hintStart + 2200;
    state.hintsLeft -= 1;
    STD.audio.playHintPing();
    STD.game.setStatus("Hint: watch the pulsing ring.", "");
    STD.game.refreshHud();
  },

  onSceneComplete: function () {
    var state = STD.game.state;
    state.finished = true;
    STD.audio.playWinArpeggio();
    var isLast = state.sceneIndex >= STD.SCENE_DIFFERENCES.length - 1;
    var heading = STD.game.el("overlay-heading");
    var text = STD.game.el("overlay-text");
    var button = STD.game.el("overlay-button");
    if (isLast) {
      heading.textContent = "You found them all!";
      text.textContent = "All " + STD.SCENE_DIFFERENCES.length + " scenes complete in " +
        STD.game.formatClock(state.totalElapsed) + " with " + state.misses + " wrong clicks. Sharp eyes!";
      button.textContent = "Play again";
    } else {
      heading.textContent = "Scene complete";
      text.textContent = "Every difference found with " + STD.game.formatClock(state.secondsLeft) +
        " to spare. Next scene is a little trickier.";
      button.textContent = "Next scene";
    }
    STD.game.el("overlay").hidden = false;
    STD.game.refreshHud();
  },

  onTimeUp: function () {
    var state = STD.game.state;
    state.finished = true;
    STD.audio.playWrongBuzz();
    var left = STD.SCENE_DIFFERENCES[state.sceneIndex].differences.length - state.found.size;
    STD.game.el("overlay-heading").textContent = "Time's up";
    STD.game.el("overlay-text").textContent =
      "The clock ran out with " + left + " difference" + (left === 1 ? "" : "s") + " still hiding. Try this scene again.";
    STD.game.el("overlay-button").textContent = "Retry scene";
    STD.game.el("overlay").hidden = false;
    STD.game.refreshHud();
  },

  onOverlayButton: function () {
    var state = STD.game.state;
    var isLast = state.sceneIndex >= STD.SCENE_DIFFERENCES.length - 1;
    if (state.secondsLeft <= 0 && state.found.size < STD.SCENE_DIFFERENCES[state.sceneIndex].differences.length) {
      STD.game.startScene(state.sceneIndex, state.totalElapsed);
    } else if (isLast) {
      STD.game.startScene(0, 0);
    } else {
      STD.game.startScene(state.sceneIndex + 1, state.totalElapsed);
    }
  },

  toggleLens: function () {
    STD.game.state.lensOn = !STD.game.state.lensOn;
    if (!STD.game.state.lensOn) STD.render.hideLens();
    STD.game.refreshHud();
  },

  toggleSound: function () {
    STD.audio.setMuted(!STD.audio.muted);
    STD.game.refreshHud();
  },

  moveCursor: function (dx, dy) {
    var state = STD.game.state;
    state.keyboardMode = true;
    state.cursor.x = Math.min(STD.PANEL_W - 4, Math.max(4, state.cursor.x + dx));
    state.cursor.y = Math.min(STD.PANEL_H - 4, Math.max(4, state.cursor.y + dy));
  },

  /* ?demo=1 pre-marks three differences and pulses a hint, for screenshots.
     ?scene=N (1-based) chooses the starting scene. Normal play is unaffected. */
  applyDemoMode: function (params) {
    var state = STD.game.state;
    var diffs = STD.SCENE_DIFFERENCES[state.sceneIndex].differences;
    for (var i = 0; i < Math.min(3, diffs.length); i++) state.found.add(diffs[i].id);
    state.hintTarget = diffs[3] || null;
    state.hintStart = performance.now();
    state.hintUntil = state.hintStart + 60000;
    state.secondsLeft = 83;
    state.hintsLeft = 2;
    if (params.get("lens") === "1") {
      state.lensOn = true;
      /* Park the magnifier over the sailboat so screenshots show the lens at work. */
      setTimeout(function () {
        STD.render.drawLens(
          STD.game.el("panel-right"), STD.render.rightBase,
          { x: 150, y: 238 }, STD.game.el("stage")
        );
      }, 250);
    }
    if (STD.game.timerHandle) clearInterval(STD.game.timerHandle);
    STD.game.setStatus("Found: " + diffs[2].label + ". " + (diffs.length - 3) + " to go.", "good");
    STD.game.refreshHud();
  },

  boot: function () {
    STD.render.initCanvases();
    var params = new URLSearchParams(window.location.search);
    var startIndex = 0;
    var sceneParam = parseInt(params.get("scene") || "1", 10);
    if (sceneParam >= 1 && sceneParam <= STD.SCENE_DIFFERENCES.length) startIndex = sceneParam - 1;

    STD.game.startScene(startIndex, 0);
    STD.game.startFrameLoop();

    STD.input.attachPointerInput({
      onMark: function (side, point) { STD.game.attemptMark(point); },
      onHover: function (side, point, canvasEl) {
        var state = STD.game.state;
        if (!state.lensOn) return;
        var base = side === "left" ? STD.render.leftBase : STD.render.rightBase;
        STD.render.drawLens(canvasEl, base, point, STD.game.el("stage"));
      },
      onLeave: function () { STD.render.hideLens(); }
    });

    STD.input.attachKeyboardInput({
      onCursorMove: function (dx, dy) { STD.game.moveCursor(dx, dy); },
      onCursorMark: function () { STD.game.attemptMark(STD.game.state.cursor); },
      isKeyboardMode: function () { return STD.game.state.keyboardMode; },
      onHintKey: function () { STD.game.useHint(); },
      onLensKey: function () { STD.game.toggleLens(); },
      onMuteKey: function () { STD.game.toggleSound(); }
    });

    STD.game.el("btn-hint").addEventListener("click", STD.game.useHint);
    STD.game.el("btn-lens").addEventListener("click", STD.game.toggleLens);
    STD.game.el("btn-sound").addEventListener("click", STD.game.toggleSound);
    STD.game.el("btn-restart").addEventListener("click", function () {
      STD.game.startScene(STD.game.state.sceneIndex, STD.game.state.totalElapsed);
    });
    STD.game.el("overlay-button").addEventListener("click", STD.game.onOverlayButton);

    if (params.get("demo") === "1") STD.game.applyDemoMode(params);
  }
};

document.addEventListener("DOMContentLoaded", STD.game.boot);
