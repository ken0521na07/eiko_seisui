// ===== localStorage管理 =====

import { itemList, defaultUnlockedById, ladders } from "./config.js";
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
