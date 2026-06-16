// ===== ゲーム状態管理 =====

import { floorGridSizes, gridSize } from "./constants.js";

// キャラクターの現在位置（マス座標）
export const position = { x: 2, y: 2 };

// 現在の部屋座標
export const room = { x: 0, y: 0, floor: 1, mapnum: 1, era: -1 };

// 通過した部屋を記録 (5次元: [era][mapnum][floor][y][x])
export const visitedRooms = {};

// 初期位置を記録
function initializeVisitedRooms() {
  if (!visitedRooms[room.era]) visitedRooms[room.era] = {};
  if (!visitedRooms[room.era][room.mapnum]) visitedRooms[room.era][room.mapnum] = {};
  if (!visitedRooms[room.era][room.mapnum][room.floor])
    visitedRooms[room.era][room.mapnum][room.floor] = Array.from(
      { length: getRoomGridSize(room.floor) },
      () => Array(getRoomGridSize(room.floor)).fill(false),
    );
  visitedRooms[room.era][room.mapnum][room.floor][room.y][room.x] = true;
}

// ゲーム状態を復元する関数（localStorage から読み込む）
export function restoreGameState(savedState) {
  if (savedState.position) {
    position.x = savedState.position.x;
    position.y = savedState.position.y;
  }
  if (savedState.room) {
    room.x = savedState.room.x;
    room.y = savedState.room.y;
    room.floor = savedState.room.floor;
    room.mapnum = savedState.room.mapnum;
    room.era = savedState.room.era !== undefined ? savedState.room.era : -1;
  }
  if (savedState.visitedRooms) {
    Object.keys(savedState.visitedRooms).forEach((era) => {
      visitedRooms[era] = savedState.visitedRooms[era];
    });
  }
  if (savedState.magicCircleStates) {
    Object.keys(savedState.magicCircleStates).forEach((key) => {
      magicCircleStates[key] = savedState.magicCircleStates[key];
    });
  }
}

initializeVisitedRooms();

// 現在のフロアの部屋数を取得
export function getRoomGridSize(floor = room.floor, mapnum = room.mapnum, era = room.era) {
  return (
    (floorGridSizes[era] &&
      floorGridSizes[era][mapnum] &&
      floorGridSizes[era][mapnum][floor]) ||
    5
  );
}

// 部屋キー生成ヘルパー関数
export function getRoomKey(
  x = room.x,
  y = room.y,
  floor = room.floor,
  mapnum = room.mapnum,
  era = room.era,
) {
  return `${x},${y},${floor},${mapnum},${era}`;
}

// 魔法陣の状態を管理（roomKey -> state）
export const magicCircleStates = {};

// 台座に置かれたアイテム: { [roomKey]: { [x,y]: item } }
export let standItems = {};

// DOM要素のキャッシュ
export let mapEl = null;
export let characterEl = null;
export let buttons = null;

// DOM要素を初期化
export function initializeDOMElements() {
  mapEl = document.getElementById("map");
  characterEl = document.getElementById("character");
  buttons = document.querySelectorAll(".dpad__btn");
}

// 石板・ボタン・ハシゴ・魔法陣のimg要素管理
export let stoneboardElements = [];
export let buttonElements = [];
export let normalMagicCircleElements = [];
export let magicCircleElements = [];

// 二度目の入室時に一時的に背景を黒にするためのフラグ
export let roomBlackout = false;

// 黒背景フラグの更新関数（他モジュールからは代入せずこの関数経由で変更）
export function setRoomBlackout(flag) {
  roomBlackout = !!flag;
}

// 一時的に操作を無効化するためのフラグ
export let controlsDisabled = false;
export function setControlsDisabled(flag) {
  controlsDisabled = !!flag;
}
