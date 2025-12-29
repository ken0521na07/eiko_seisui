// ===== リセット機能 =====

import { itemList, defaultUnlockedById } from "./config.js";
import { standItems } from "./state.js";
import { resetAllStorage } from "./storage.js";
import { renderGame } from "./ui.js";

export function reset() {
  resetAllStorage();

  // itemListを初期状態に戻す（コード定義の初期値を使う）
  itemList.forEach((item) => {
    item.unlocked = defaultUnlockedById[item.id] || false;
  });

  // standItemsを空にする
  Object.keys(standItems).forEach((key) => {
    delete standItems[key];
  });

  // UI更新
  renderGame();

  console.log("石板調査状態・宝箱・アイテム・台座配置をリセットしました。");
}

window.reset = reset;
