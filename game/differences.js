"use strict";
/* differences.js — the difference data for every scene.
   Each difference: id, panel-space centre (x, y), hit radius r, kind, and a short label
   shown in the status line once found. Panel space is 560 x 420. */
window.STD = window.STD || {};

STD.PANEL_W = 560;
STD.PANEL_H = 420;

STD.SCENE_DIFFERENCES = [
  {
    sceneId: "harbour",
    sceneName: "Harbour Dawn",
    differences: [
      { id: "extra-cloud",   x: 96,  y: 62,  r: 30, kind: "added",   label: "an extra small cloud" },
      { id: "lantern-teal",  x: 66,  y: 252, r: 22, kind: "colour",  label: "the left lantern glows teal" },
      { id: "missing-crate", x: 452, y: 356, r: 28, kind: "removed", label: "a crate is missing from the dock" },
      { id: "sail-stripe",   x: 150, y: 238, r: 30, kind: "added",   label: "a red stripe on the sail" },
      { id: "lit-window",    x: 330, y: 196, r: 20, kind: "colour",  label: "one cottage window is lit" },
      { id: "extra-gull",    x: 430, y: 84,  r: 24, kind: "added",   label: "an extra gull in the sky" },
      { id: "buoy-green",    x: 268, y: 316, r: 22, kind: "colour",  label: "the buoy changed colour" }
    ]
  },
  {
    sceneId: "garden",
    sceneName: "Garden Lane",
    differences: [
      { id: "apple-count",    x: 452, y: 150, r: 30, kind: "removed", label: "fewer apples on the tree" },
      { id: "tulip-colour",   x: 128, y: 330, r: 26, kind: "colour",  label: "the tulips changed colour" },
      { id: "butterfly",      x: 300, y: 120, r: 22, kind: "added",   label: "a butterfly over the path" },
      { id: "can-colour",     x: 196, y: 352, r: 24, kind: "colour",  label: "the watering can changed colour" },
      { id: "birdhouse-roof", x: 96,  y: 168, r: 24, kind: "colour",  label: "the birdhouse roof changed colour" },
      { id: "missing-stone",  x: 330, y: 372, r: 24, kind: "removed", label: "a stepping stone is missing" },
      { id: "curtain-colour", x: 238, y: 206, r: 22, kind: "colour",  label: "the cottage curtains changed colour" },
      { id: "extra-mushroom", x: 408, y: 366, r: 22, kind: "added",   label: "an extra mushroom by the fence" }
    ]
  },
  {
    sceneId: "market",
    sceneName: "Market Dusk",
    differences: [
      { id: "awning-stripe",  x: 140, y: 150, r: 32, kind: "colour",  label: "the left awning stripes changed colour" },
      { id: "missing-lantern",x: 392, y: 96,  r: 22, kind: "removed", label: "a lantern is missing from the string" },
      { id: "fruit-swap",     x: 250, y: 282, r: 28, kind: "colour",  label: "the fruit in the middle crate changed" },
      { id: "sign-letter",    x: 452, y: 196, r: 24, kind: "changed", label: "the shop sign letter changed" },
      { id: "extra-barrel",   x: 66,  y: 330, r: 26, kind: "added",   label: "an extra barrel by the stall" },
      { id: "clock-hands",    x: 300, y: 84,  r: 24, kind: "changed", label: "the clock shows a different time" },
      { id: "cat-on-crate",   x: 356, y: 322, r: 26, kind: "added",   label: "a cat sitting on a crate" },
      { id: "flag-colour",    x: 512, y: 120, r: 22, kind: "colour",  label: "the flag changed colour" },
      { id: "crate-count",    x: 168, y: 344, r: 26, kind: "removed", label: "one crate fewer under the stall" }
    ]
  }
];

/* Returns the difference whose hit circle contains (x, y), or null. */
STD.findDifferenceAt = function (sceneIndex, x, y) {
  var list = STD.SCENE_DIFFERENCES[sceneIndex].differences;
  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    var dx = x - d.x, dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
};
