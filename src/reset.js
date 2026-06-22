// ===== リセット機能 =====

import { itemList, defaultUnlockedById, ladders } from "./config.js";
import {
  position,
  room,
  visitedRooms,
  magicCircleStates,
  standItems,
  getRoomGridSize,
} from "./state.js";
import { resetAllStorage } from "./storage.js";
import { renderGame } from "./ui.js";

// 初期ロード時のハシゴ解放状態を保存
const initialLaddersState = ladders.map((l) => ({
  roomKey: l.roomKey,
  x: l.x,
  y: l.y,
  unlocked: l.unlocked,
}));

export function reset() {
  resetAllStorage();

  // itemListを初期状態に戻す（個数 count もリセットする）
  itemList.forEach((item) => {
    const defaultState = defaultUnlockedById[item.id] || false;
    item.unlocked = defaultState;
    item.count = defaultState ? 1 : 0;
  });

  // standItemsを空にする
  Object.keys(standItems).forEach((key) => {
    delete standItems[key];
  });

  // laddersの解放状態を初期状態に戻す
  ladders.forEach((l) => {
    const initial = initialLaddersState.find(
      (init) => init.roomKey === l.roomKey && init.x === l.x && init.y === l.y
    );
    if (initial) {
      l.unlocked = initial.unlocked;
    }
  });

  // プレイヤーの位置と部屋、通過記録、魔法陣状態を初期位置にリセット
  position.x = 2;
  position.y = 2;
  
  room.x = 0;
  room.y = 0;
  room.floor = 2;
  room.mapnum = 1;
  room.era = 0;

  // visitedRoomsをクリアして初期化
  Object.keys(visitedRooms).forEach((key) => {
    delete visitedRooms[key];
  });
  if (!visitedRooms[room.era]) visitedRooms[room.era] = {};
  if (!visitedRooms[room.era][room.mapnum]) visitedRooms[room.era][room.mapnum] = {};
  if (!visitedRooms[room.era][room.mapnum][room.floor]) {
    const size = getRoomGridSize(room.floor, room.mapnum, room.era);
    visitedRooms[room.era][room.mapnum][room.floor] = Array.from(
      { length: size },
      () => Array(size).fill(false)
    );
  }
  visitedRooms[room.era][room.mapnum][room.floor][room.y][room.x] = true;

  // magicCircleStatesをクリア
  Object.keys(magicCircleStates).forEach((key) => {
    delete magicCircleStates[key];
  });

  // UI更新
  renderGame();

  console.log("ゲーム状態を初期化しました（所持アイテム数、ハシゴ、位置、部屋の記録もすべてリセットされました）。");
}

window.reset = reset;

