"use strict";
/* input.js — pointer and keyboard input for both panels.
   Converts screen events to panel-space points and forwards them to the game. */
window.STD = window.STD || {};

STD.input = {

  /* Converts a pointer event on a panel canvas to panel-space coordinates. */
  canvasPointFromEvent: function (canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var clientX = event.touches ? event.touches[0].clientX : event.clientX;
    var clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: (clientX - rect.left) * (STD.PANEL_W / rect.width),
      y: (clientY - rect.top) * (STD.PANEL_H / rect.height)
    };
  },

  attachPointerInput: function (handlers) {
    var panels = [
      { el: document.getElementById("panel-left"), side: "left" },
      { el: document.getElementById("panel-right"), side: "right" }
    ];
    panels.forEach(function (panel) {
      panel.el.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        handlers.onMark(panel.side, STD.input.canvasPointFromEvent(panel.el, event));
      });
      panel.el.addEventListener("pointermove", function (event) {
        handlers.onHover(panel.side, STD.input.canvasPointFromEvent(panel.el, event), panel.el);
      });
      panel.el.addEventListener("pointerleave", function () { handlers.onLeave(); });
    });
  },

  /* Arrow keys move the cursor ring; Enter or Space marks at the cursor. */
  attachKeyboardInput: function (handlers) {
    document.addEventListener("keydown", function (event) {
      var step = event.shiftKey ? 24 : 10;
      switch (event.key) {
        case "ArrowLeft":  handlers.onCursorMove(-step, 0); event.preventDefault(); break;
        case "ArrowRight": handlers.onCursorMove(step, 0);  event.preventDefault(); break;
        case "ArrowUp":    handlers.onCursorMove(0, -step); event.preventDefault(); break;
        case "ArrowDown":  handlers.onCursorMove(0, step);  event.preventDefault(); break;
        case "Enter":
        case " ":
          if (handlers.isKeyboardMode()) { handlers.onCursorMark(); event.preventDefault(); }
          break;
        case "h": case "H": handlers.onHintKey(); break;
        case "l": case "L": handlers.onLensKey(); break;
        case "m": case "M": handlers.onMuteKey(); break;
      }
    });
  }
};
