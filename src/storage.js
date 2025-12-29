// ===== localStorage管理 =====

import { itemList, defaultUnlockedById } from "./config.js";
import { standItems } from "./state.js";

// --- アイテム入手状態管理 ---
export function saveUnlockedItems() {
  const unlockedIds = itemList.filter((i) => i.unlocked).map((i) => i.id);
  localStorage.setItem("unlockedItems", JSON.stringify(unlockedIds));
}

export function loadUnlockedItems() {
  try {
    const unlockedIds = JSON.parse(
      localStorage.getItem("unlockedItems") || "[]"
    );
    itemList.forEach((i) => {
      const defaultState = defaultUnlockedById[i.id] || false;
      i.unlocked = defaultState || unlockedIds.includes(i.id);
    });
  } catch {}
}

// --- 台座配置状態管理 ---
export function saveStandItems() {
  localStorage.setItem("standItems", JSON.stringify(standItems));
}

export function loadStandItems() {
  try {
    const data = JSON.parse(localStorage.getItem("standItems") || "{}") || {};
    Object.assign(standItems, data);
  } catch {
    // standItemsは既に {}で初期化されている
  }
}

// 石板調査済み状態をlocalStorageで管理
export function getCheckedStoneboards() {
  return JSON.parse(localStorage.getItem("checkedStoneboards") || "{}");
}

export function setCheckedStoneboard(roomKey, x, y) {
  const checked = getCheckedStoneboards();
  if (!checked[roomKey]) checked[roomKey] = [];
  checked[roomKey].push(`${x},${y}`);
  localStorage.setItem("checkedStoneboards", JSON.stringify(checked));
}

export function isCheckedStoneboard(roomKey, x, y) {
  const checked = getCheckedStoneboards();
  return checked[roomKey]?.includes(`${x},${y}`);
}

// --- 宝箱開封状態管理 ---
export function getOpenedBoxes() {
  try {
    return JSON.parse(localStorage.getItem("openedBoxes") || "{}") || {};
  } catch {
    return {};
  }
}

export function setOpenedBox(roomKey, x, y) {
  const opened = getOpenedBoxes();
  if (!opened[roomKey]) opened[roomKey] = [];
  if (!opened[roomKey].some((b) => b.x === x && b.y === y)) {
    opened[roomKey].push({ x, y });
    localStorage.setItem("openedBoxes", JSON.stringify(opened));
  }
}

export function isOpenedBox(roomKey, x, y) {
  const opened = getOpenedBoxes();
  return opened[roomKey] && opened[roomKey].some((b) => b.x === x && b.y === y);
}

// --- 2F宝箱開封順序管理 ---
export function getBoxOpenOrder() {
  try {
    return JSON.parse(localStorage.getItem("boxOpenOrder") || "[]") || [];
  } catch {
    return [];
  }
}

export function addBoxOpenOrder(roomKey) {
  const order = getBoxOpenOrder();
  order.push(roomKey);
  localStorage.setItem("boxOpenOrder", JSON.stringify(order));
}

export function resetBoxOpenOrder() {
  localStorage.removeItem("boxOpenOrder");
}

export function checkBoxOpenSequence() {
  const order = getBoxOpenOrder();
  const correctOrder = ["1,0,2,1", "0,1,2,1", "1,2,2,1", "2,1,2,1"];
  if (order.length !== 4) return null;
  const isCorrect = order.every((key, i) => key === correctOrder[i]);
  return isCorrect;
}

// --- 2F中央誘導管理 ---
export function getFloor2CenterUnlocked() {
  try {
    return JSON.parse(localStorage.getItem("floor2CenterUnlocked") || "false");
  } catch {
    return false;
  }
}

export function setFloor2CenterUnlocked() {
  localStorage.setItem("floor2CenterUnlocked", JSON.stringify(true));
}

// --- リセット関数 ---
export function resetAllStorage() {
  localStorage.removeItem("checkedStoneboards");
  localStorage.removeItem("openedBoxes");
  localStorage.removeItem("standItems");
  localStorage.removeItem("unlockedItems");
  localStorage.removeItem("floor2CenterUnlocked");
  resetBoxOpenOrder();
}
