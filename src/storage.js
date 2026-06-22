// ===== localStorage管理 =====

import { itemList, defaultUnlockedById, ladders } from "./config.js";
import { standItems } from "./state.js";

// --- アイテム入手状態管理 ---
export function saveUnlockedItems() {
  const unlocked = {};
  itemList.forEach((i) => {
    if (i.unlocked) {
      unlocked[i.id] = i.count || 1;
    }
  });
  localStorage.setItem("unlockedItems", JSON.stringify(unlocked));
}

export function loadUnlockedItems() {
  try {
    const raw = localStorage.getItem("unlockedItems") || "[]";
    let unlocked = {};
    if (raw.trim().startsWith("[")) {
      // 古い配列形式の互換
      const arr = JSON.parse(raw);
      arr.forEach((id) => {
        unlocked[id] = 1;
      });
    } else {
      unlocked = JSON.parse(raw);
    }
    itemList.forEach((i) => {
      const defaultState = defaultUnlockedById[i.id] || false;
      const savedCount = unlocked[i.id];
      if (savedCount !== undefined) {
        i.unlocked = true;
        i.count = savedCount;
      } else {
        i.unlocked = defaultState;
        i.count = defaultState ? 1 : 0;
      }
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
  const correctOrder = ["1,0,2,1,-1", "0,1,2,1,-1", "1,2,2,1,-1", "2,1,2,1,-1"];
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

// --- ゲーム状態管理 (position, room, visitedRooms, magicCircleStates) ---
export function saveGameState(position, room, visitedRooms, magicCircleStates) {
  try {
    localStorage.setItem("gamePosition", JSON.stringify(position));
    localStorage.setItem("gameRoom", JSON.stringify(room));
    localStorage.setItem("visitedRooms", JSON.stringify(visitedRooms));
    localStorage.setItem(
      "magicCircleStates",
      JSON.stringify(magicCircleStates)
    );
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
}

export function loadGameState() {
  try {
    const positionData = localStorage.getItem("gamePosition");
    const roomData = localStorage.getItem("gameRoom");
    const visitedData = localStorage.getItem("visitedRooms");
    const magicData = localStorage.getItem("magicCircleStates");

    return {
      position: positionData ? JSON.parse(positionData) : null,
      room: roomData ? JSON.parse(roomData) : null,
      visitedRooms: visitedData ? JSON.parse(visitedData) : null,
      magicCircleStates: magicData ? JSON.parse(magicData) : null,
    };
  } catch (e) {
    console.error("Failed to load game state:", e);
    return {
      position: null,
      room: null,
      visitedRooms: null,
      magicCircleStates: null,
    };
  }
}

// --- リセット関数 ---
export function resetAllStorage() {
  localStorage.removeItem("checkedStoneboards");
  localStorage.removeItem("gamePosition");
  localStorage.removeItem("gameRoom");
  localStorage.removeItem("visitedRooms");
  localStorage.removeItem("magicCircleStates");
  localStorage.removeItem("openedBoxes");
  localStorage.removeItem("standItems");
  localStorage.removeItem("unlockedItems");
  localStorage.removeItem("floor2CenterUnlocked");
  localStorage.removeItem("unlockedLaddersRoomKeys");
  localStorage.removeItem("usedItems");
  localStorage.removeItem("placedPanels");
  localStorage.removeItem("roomRotated");
  localStorage.removeItem("redButtonUsed");
  resetBoxOpenOrder();
}

// --- ハシゴ解放状態管理（部屋キー単位で保持） ---
export function getUnlockedLaddersRoomKeys() {
  try {
    return (
      JSON.parse(localStorage.getItem("unlockedLaddersRoomKeys") || "[]") || []
    );
  } catch {
    return [];
  }
}

export function addUnlockedLaddersRoomKey(roomKey) {
  const list = getUnlockedLaddersRoomKeys();
  if (!list.includes(roomKey)) {
    list.push(roomKey);
    localStorage.setItem("unlockedLaddersRoomKeys", JSON.stringify(list));
  }
}

export function loadUnlockedLadders() {
  const list = getUnlockedLaddersRoomKeys();
  // 保存された部屋キーに属するハシゴを解放
  ladders.forEach((l) => {
    if (list.includes(l.roomKey)) {
      l.unlocked = true;
    }
  });
}

// --- 使用済みアイテム管理 ---
export function getUsedItems() {
  try {
    return JSON.parse(localStorage.getItem("usedItems") || "{}") || {};
  } catch {
    return {};
  }
}

export function setUsedItem(roomKey, x, y, itemId) {
  const used = getUsedItems();
  if (!used[roomKey]) used[roomKey] = [];
  if (!used[roomKey].some((item) => item.x === x && item.y === y && item.itemId === itemId)) {
    used[roomKey].push({ x, y, itemId });
    localStorage.setItem("usedItems", JSON.stringify(used));
  }
}

export function isUsedItem(roomKey, x, y, itemId) {
  const used = getUsedItems();
  return used[roomKey] && used[roomKey].some((item) => item.x === x && item.y === y && item.itemId === itemId);
}

// --- 3x3パネル配置盤面管理 ---
export function getPlacedPanels() {
  try {
    return JSON.parse(localStorage.getItem("placedPanels") || "{}") || {};
  } catch {
    return {};
  }
}

export function setPlacedPanel(x, y, index, panelData) {
  const state = getPlacedPanels();
  const key = `${x},${y}`;
  if (!state[key]) {
    state[key] = Array(9).fill(null);
  }
  state[key][index] = panelData;
  localStorage.setItem("placedPanels", JSON.stringify(state));
}

// --- 部屋回転状態管理 ---
export function getRoomRotated() {
  try {
    return JSON.parse(localStorage.getItem("roomRotated") || "false");
  } catch {
    return false;
  }
}

export function setRoomRotated(rotated) {
  localStorage.setItem("roomRotated", JSON.stringify(rotated));
}

// --- 赤いボタン使用記録管理 ---
export function isRedButtonUsed() {
  try {
    return JSON.parse(localStorage.getItem("redButtonUsed") || "false");
  } catch {
    return false;
  }
}

export function setRedButtonUsed(used) {
  localStorage.setItem("redButtonUsed", JSON.stringify(used));
}

