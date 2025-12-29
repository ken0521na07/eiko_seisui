// ===== 入力制御 =====

import { move } from "./movement.js";
import { controlsDisabled } from "./state.js";
import { renderGame } from "./ui.js";
import { showItemModal } from "./utils.js";
import { reset } from "./reset.js";

export function initializeInputHandlers() {
  // キーボード入力
  function handleKey(event) {
    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const dir = keyMap[event.key];
    if (!dir) return;
    if (controlsDisabled) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    move(dir);
  }

  window.addEventListener("keydown", handleKey);

  // D-pad ボタン
  const buttons = document.querySelectorAll(".dpad__btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (controlsDisabled) return;
      move(btn.dataset.dir);
    });
  });

  // ウィンドウリサイズ
  window.addEventListener("resize", () => {
    renderGame();
  });

  // リセットボタン
  let resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) {
    resetBtn = document.createElement("button");
    resetBtn.id = "reset-btn";
    resetBtn.textContent = "石板リセット";
    resetBtn.style.position = "fixed";
    resetBtn.style.top = "16px";
    resetBtn.style.left = "50%";
    resetBtn.style.transform = "translateX(-50%)";
    resetBtn.style.zIndex = 1000;
    resetBtn.style.padding = "8px 24px";
    resetBtn.style.fontSize = "1.1rem";
    resetBtn.style.background = "#fff";
    resetBtn.style.border = "1px solid #888";
    resetBtn.style.borderRadius = "8px";
    resetBtn.style.cursor = "pointer";
    resetBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    resetBtn.addEventListener("click", () => {
      if (controlsDisabled) return;
      reset();
    });
    document.body.appendChild(resetBtn);
  }

  // アイテムボタン
  let itemBtn = document.getElementById("item-btn");
  if (!itemBtn) {
    itemBtn = document.createElement("button");
    itemBtn.id = "item-btn";
    itemBtn.textContent = "アイテム";
    itemBtn.style.position = "fixed";
    itemBtn.style.top = "18px";
    itemBtn.style.right = "24px";
    itemBtn.style.zIndex = 1200;
    itemBtn.style.padding = "8px 24px";
    itemBtn.style.fontSize = "1.1rem";
    itemBtn.style.background = "#fff";
    itemBtn.style.border = "1px solid #888";
    itemBtn.style.borderRadius = "8px";
    itemBtn.style.cursor = "pointer";
    itemBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    itemBtn.addEventListener("click", () => {
      if (controlsDisabled) return;
      showItemModal();
    });
    document.body.appendChild(itemBtn);
  }

  // モーダル閉じるボタン
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
}
