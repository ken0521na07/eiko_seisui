const gridSize = 5;
// マップ画像サイズ（px）
const MAP_PX = 340;
const SAFE_MARGIN = 20; // 端から削る領域(px)
const PLAYABLE_PX = MAP_PX - SAFE_MARGIN * 2; // 300

// キャラクターの現在位置（マス座標）
const position = { x: 2, y: 2 };
// 現在の部屋座標（5x5の部屋グリッド、左下が(0,4)）
const roomGridSize = 5;
const room = { x: 0, y: 4 };

const mapEl = document.getElementById("map");
const characterEl = document.getElementById("character");
const buttons = document.querySelectorAll(".dpad__btn");

const directions = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function setTileSize() {
  // プレイ可能領域をgridで割る
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  mapEl.style.setProperty("--tile-size", `${tileSize}px`);
  // widthはCSSのaspect-ratioで自動調整、heightのみ指定
  characterEl.style.height = `${tileSize}px`;
  characterEl.style.width = "auto";
  return tileSize;
}

function render() {
  const tileSize = setTileSize();
  // 部屋の背景画像切り替え
  const bgImg = mapEl.querySelector(".map__background");
  // どの方向に隣接部屋があるか判定
  const up = room.y > 0;
  const down = room.y < roomGridSize - 1;
  const left = room.x > 0;
  const right = room.x < roomGridSize - 1;
  let key = "";
  if (up) key += "u";
  if (down) key += "d";
  if (right) key += "r";
  if (left) key += "l";
  if (key) {
    bgImg.src = `../img/map/map_${key}.webp`;
  } else {
    bgImg.src = "../img/UI/background_0.webp";
  }

  // キャラクターの足元がマスの下端に揃うように配置。ただしmapからはみ出さないように制限
  // キャラクター画像の左右をマスの中央に合わせる
  // 端からSAFE_MARGIN分ずらす
  const x =
    SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
    position.x * tileSize +
    (tileSize - characterEl.offsetWidth) / 2;
  // キャラクター画像の最下端をマスの下端に合わせる
  let y =
    SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
    (position.y + 1) * tileSize -
    characterEl.offsetHeight;
  characterEl.style.transform = `translate(${x}px, ${y}px)`;
}

function move(dir) {
  const delta = directions[dir];
  if (!delta) return;
  const [dx, dy] = delta;
  let nextX = position.x + dx;
  let nextY = position.y + dy;

  // 部屋の端の中央マスから外に出る場合、隣接部屋へ移動
  let movedRoom = false;
  // 部屋移動時はアニメーションを一時的に無効化
  function disableCharacterTransition() {
    characterEl.style.transition = "none";
    // 強制再描画
    void characterEl.offsetWidth;
  }
  function enableCharacterTransition() {
    characterEl.style.transition = "";
  }
  if (nextY < 0 && position.x === 2 && dy === -1 && room.y > 0) {
    disableCharacterTransition();
    // 上端中央
    room.y -= 1;
    nextY = gridSize - 1;
    nextX = 2;
    movedRoom = true;
  } else if (
    nextY >= gridSize &&
    position.x === 2 &&
    dy === 1 &&
    room.y < roomGridSize - 1
  ) {
    // 下端中央
    room.y += 1;
    nextY = 0;
    nextX = 2;
    disableCharacterTransition();
    movedRoom = true;
  } else if (nextX < 0 && position.y === 2 && dx === -1 && room.x > 0) {
    disableCharacterTransition();
    // 左端中央
    room.x -= 1;
    nextX = gridSize - 1;
    nextY = 2;
    movedRoom = true;
  } else if (
    nextX >= gridSize &&
    position.y === 2 &&
    dx === 1 &&
    room.x < roomGridSize - 1
  ) {
    // 右端中央
    room.x += 1;
    nextX = 0;
    nextY = 2;
    disableCharacterTransition();
    movedRoom = true;
  }

  // 通常の範囲内移動
  if (!movedRoom) {
    nextX = clamp(nextX, 0, gridSize - 1);
    nextY = clamp(nextY, 0, gridSize - 1);
    if (nextX === position.x && nextY === position.y) return;
  }
  position.x = nextX;
  position.y = nextY;
  render();
  // 部屋移動後はアニメーションを戻す
  if (movedRoom) {
    setTimeout(enableCharacterTransition, 0);
  }
}

function handleKey(event) {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };
  const dir = keyMap[event.key];
  if (!dir) return;
  event.preventDefault();
  move(dir);
}

window.addEventListener("keydown", handleKey);

buttons.forEach((btn) => {
  btn.addEventListener("click", () => move(btn.dataset.dir));
});

window.addEventListener("resize", render);

render();
