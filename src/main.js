// ===== メインエントリーポイント =====

import { initializeDOMElements, restoreGameState } from "./state.js";
import {
  loadUnlockedItems,
  loadStandItems,
  loadGameState,
  loadUnlockedLadders,
} from "./storage.js";
import { renderGame } from "./ui.js";
import { initializeInputHandlers } from "./input.js";

// ゲーム初期化
window.addEventListener("DOMContentLoaded", () => {
  // DOM要素を初期化
  initializeDOMElements();

  // ローカルストレージから状態復元
  loadUnlockedItems();
  loadStandItems();
  loadUnlockedLadders();
  const savedState = loadGameState();
  restoreGameState(savedState);

  // 入力ハンドラー初期化
  initializeInputHandlers();

  // 初期描画
  renderGame();

  console.log("ゲーム初期化完了");
});
