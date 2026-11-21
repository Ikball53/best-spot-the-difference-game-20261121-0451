"use strict";
/* audio.js — tiny WebAudio sounds: a chime on find, a buzz on a wrong click,
   a short arpeggio on scene complete. All oscillators, no audio files. */
window.STD = window.STD || {};

STD.audio = {
  context: null,
  muted: false,

  ensureContext: function () {
    if (!STD.audio.context) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) STD.audio.context = new AC();
    }
    if (STD.audio.context && STD.audio.context.state === "suspended") STD.audio.context.resume();
    return STD.audio.context;
  },

  tone: function (freq, startDelay, duration, type, volume) {
    var ctx = STD.audio.ensureContext();
    if (!ctx || STD.audio.muted) return;
    var t0 = ctx.currentTime + startDelay;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(volume || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + duration + 0.02);
  },

  playFindChime: function () {
    STD.audio.tone(880, 0, 0.16, "sine", 0.14);
    STD.audio.tone(1318, 0.07, 0.22, "sine", 0.12);
  },

  playWrongBuzz: function () {
    STD.audio.tone(160, 0, 0.18, "sawtooth", 0.07);
    STD.audio.tone(120, 0.02, 0.2, "sawtooth", 0.06);
  },

  playHintPing: function () {
    STD.audio.tone(1568, 0, 0.12, "triangle", 0.1);
    STD.audio.tone(1568, 0.16, 0.12, "triangle", 0.08);
  },

  playWinArpeggio: function () {
    var notes = [523, 659, 784, 1047];
    for (var i = 0; i < notes.length; i++) STD.audio.tone(notes[i], i * 0.11, 0.28, "triangle", 0.13);
  },

  setMuted: function (muted) { STD.audio.muted = !!muted; }
};
