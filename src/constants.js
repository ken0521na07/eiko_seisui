// ===== ゲーム定数 =====

// グリッドサイズ（1部屋あたりのマス数）
export const gridSize = 5;

// マップ画像サイズ（px）
export const MAP_PX = 340;

// 端からの安全マージン（px）
export const SAFE_MARGIN = 20;

// プレイ可能領域サイズ（px）
export const PLAYABLE_PX = MAP_PX - SAFE_MARGIN * 2; // 300

// フロアごとの部屋数定義 {mapnum: {floor: roomCount}}
export const floorGridSizes = {
  1: {
    // mapnum=1: 1F=5x5, 2F=3x3, 3F=1x1
    1: 5,
    2: 3,
    3: 1,
  },
  2: {
    // mapnum=2: 0F=5x5, 1F=3x3, 2F=1x1
    0: 5,
    1: 3,
    2: 1,
  },
  3: {
    // mapnum=3: 1Fのみ、1x1（部屋サイズは同様）
    1: 1,
  },
};

// 方向ベクトル定義
export const directions = {
  up: [0, 1],
  down: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};

// ユーティリティ: 値を範囲内にクラップ
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
