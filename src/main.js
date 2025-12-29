// ===== メインエントリーポイント =====

import { initializeDOMElements } from "./state.js";
import { loadUnlockedItems, loadStandItems } from "./storage.js";
import { renderGame } from "./ui.js";
import { initializeInputHandlers } from "./input.js";

// ゲーム初期化
window.addEventListener("DOMContentLoaded", () => {
  // DOM要素を初期化
  initializeDOMElements();

  // ローカルストレージから状態復元
  loadUnlockedItems();
  loadStandItems();

  // 入力ハンドラー初期化
  initializeInputHandlers();

  // 初期描画
  renderGame();

  console.log("ゲーム初期化完了");
});
