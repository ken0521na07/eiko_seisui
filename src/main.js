// モーダル表示関数
function showModal(imgSrc, text) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalText = document.getElementById("modal-text");
  modalImg.src = imgSrc;
  modalText.textContent = text;
  modal.style.display = "flex";
}

// モーダル閉じる処理
window.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("modal-close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  // モーダル外クリックで閉じる
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});
const gridSize = 5;
// マップ画像サイズ（px）
const MAP_PX = 340;
const SAFE_MARGIN = 20; // 端から削る領域(px)
const PLAYABLE_PX = MAP_PX - SAFE_MARGIN * 2; // 300

// キャラクターの現在位置（マス座標）
const position = { x: 2, y: 2 };
// 現在の部屋座標（5x5の部屋グリッド、左下が(0,0)）
const roomGridSize = 5;
const room = { x: 2, y: 4 };
// 通過した部屋を記録
const visitedRooms = Array.from({ length: roomGridSize }, () =>
  Array(roomGridSize).fill(false)
);
visitedRooms[room.y][room.x] = true;

const mapEl = document.getElementById("map");
const characterEl = document.getElementById("character");
const buttons = document.querySelectorAll(".dpad__btn");

// 石板配置データ: { [roomKey]: [{ x, y, img }] }
const stoneboards = {
  // 部屋(1,0)の(2,0)に石板
  "1,0": [{ x: 2, y: 0, img: "nazo_1-1-22.png" }],
  // 部屋(3,0)の(2,0)に石板
  "3,0": [{ x: 2, y: 0, img: "nazo_1-1-24.png" }],
  // 部屋(1,4)の(2,4)に石板
  "1,4": [{ x: 2, y: 4, img: "nazo_1-1-2.png" }],
  // 部屋(3,4)の(2,4)に石板
  "3,4": [{ x: 2, y: 4, img: "nazo_1-1-4.png" }],
  // 部屋(0,1)の(0,2)に石板
  "0,1": [{ x: 0, y: 2, img: "nazo_1-1-16.png" }],
  // 部屋(0,3)の(0,2)に石板
  "0,3": [{ x: 0, y: 2, img: "nazo_1-1-6.png" }],
  // 部屋(4,1)の(4,2)に石板
  "4,1": [{ x: 4, y: 2, img: "nazo_1-1-20.png" }],
  // 部屋(4,3)の(4,2)に石板
  "4,3": [{ x: 4, y: 2, img: "nazo_1-1-10.png" }],
};

// 石板img要素を管理
let stoneboardElements = [];
// 石板調査済み状態をlocalStorageで管理
function getCheckedStoneboards() {
  return JSON.parse(localStorage.getItem("checkedStoneboards") || "{}");
}
function setCheckedStoneboard(roomKey, x, y) {
  const checked = getCheckedStoneboards();
  if (!checked[roomKey]) checked[roomKey] = [];
  checked[roomKey].push(`${x},${y}`);
  localStorage.setItem("checkedStoneboards", JSON.stringify(checked));
}
function isCheckedStoneboard(roomKey, x, y) {
  const checked = getCheckedStoneboards();
  return checked[roomKey]?.includes(`${x},${y}`);
}

function renderStoneboards() {
  // 既存の石板imgを削除
  stoneboardElements.forEach((el) => el.remove());
  stoneboardElements = [];
  // 現在の部屋に石板があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = `${room.x},${room.y}`;
  const boards = stoneboards[roomKey] || [];
  boards.forEach(({ x, y, img: imgName }) => {
    const img = document.createElement("img");
    img.src = "img/UI/stoneboard.png";
    img.alt = "石板";
    img.className = "stoneboard";
    img.style.position = "absolute";
    img.style.left = `${
      SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
    }px`;
    const boardWidth = tileSize;
    const boardHeight = tileSize * (117 / 501);
    img.style.width = `${boardWidth}px`;
    img.style.height = `${boardHeight}px`;
    // (2,4)のマスだけ上端、(0,2)は左寄せ90度回転、(4,2)は右寄せ90度回転
    if (x === 2 && y === 4) {
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y) * tileSize
      }px`;
    } else if (x === 0 && y === 2) {
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - y + 0.5) * tileSize -
        boardWidth / 2
      }px`;
      img.style.left = `${SAFE_MARGIN * (mapEl.clientWidth / MAP_PX)}px`;
      img.style.transform = "rotate(270deg)";
      img.style.transformOrigin = "left top";
    } else if (x === 4 && y === 2) {
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - y + 0.5) * tileSize -
        boardWidth / 2
      }px`;
      img.style.right = `${SAFE_MARGIN * (mapEl.clientWidth / MAP_PX)}px`;
      img.style.transform = "rotate(90deg)";
      img.style.transformOrigin = "right top";
    } else {
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y + 1) * tileSize -
        boardHeight
      }px`;
    }
    img.style.zIndex = 5;
    // チェック画像（未調査なら表示）
    if (!isCheckedStoneboard(roomKey, x, y)) {
      const checkImg = document.createElement("img");
      checkImg.src = "img/UI/check.png";
      checkImg.alt = "未調査";
      checkImg.className = "stoneboard-check";
      checkImg.style.position = "absolute";
      checkImg.style.left = img.style.left;
      // マスの上端に合わせる
      checkImg.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y) * tileSize
      }px`;
      checkImg.style.width = `${tileSize}px`;
      checkImg.style.height = `${tileSize}px`;
      checkImg.style.zIndex = 6;
      // クリックを透過させる
      checkImg.style.pointerEvents = "none";
      mapEl.appendChild(checkImg);
      stoneboardElements.push(checkImg);
    }
    img.addEventListener("click", () => {
      // キャラクターが同じマスにいるときのみ調べられる
      if (position.x === x && position.y === y) {
        showModal(`img/nazo/${imgName}`, "壁に何か書かれている");
        setCheckedStoneboard(roomKey, x, y);
        renderStoneboards(); // 状態更新
      }
    });
    mapEl.appendChild(img);
    stoneboardElements.push(img);
  });
}

// 台座配置データ: { [roomKey]: [{ x, y }] }
const stands = {
  "0,0": [{ x: 0, y: 0 }],
  "2,0": [{ x: 0, y: 0 }],
  "4,0": [{ x: 0, y: 0 }],
  "1,1": [{ x: 0, y: 0 }],
  "3,1": [{ x: 0, y: 0 }],
  "0,2": [{ x: 0, y: 0 }],
  "2,2": [{ x: 0, y: 0 }],
  "4,2": [{ x: 0, y: 0 }],
  "1,3": [{ x: 2, y: 2 }],
  "3,3": [{ x: 2, y: 2 }],
  "0,4": [{ x: 0, y: 0 }],
  "2,4": [{ x: 0, y: 0 }],
  "4,4": [{ x: 0, y: 0 }],
};

function renderStands() {
  // 既存の台座imgを削除
  const oldStands = document.querySelectorAll(".stand");
  oldStands.forEach((el) => el.remove());
  // 現在の部屋に台座があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = `${room.x},${room.y}`;
  const list = stands[roomKey] || [];
  list.forEach(({ x, y }) => {
    const img = document.createElement("img");
    img.src = "img/UI/stand.png";
    img.alt = "台座";
    img.className = "stand";
    img.style.position = "absolute";
    img.style.left = `${
      SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
    }px`;
    img.style.top = `${
      SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
      (gridSize - 1 - y) * tileSize
    }px`;
    img.style.height = `${tileSize * 0.9}px`;
    img.style.width = "auto";
    // 左右中央揃え
    img.style.left = `${
      SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
      x * tileSize +
      (tileSize - (tileSize * 0.9 * img.naturalWidth) / img.naturalHeight) / 2
    }px`;
    // naturalWidth/Heightがまだ取得できない場合はload後に再調整
    img.onload = function () {
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
        x * tileSize +
        (tileSize - img.offsetWidth) / 2
      }px`;
    };
    img.style.zIndex = 7;
    img.addEventListener("click", () => {
      // 隣接マスにいる場合のみ反応
      const dx = Math.abs(position.x - x);
      const dy = Math.abs(position.y - y);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        showModal("img/UI/stand.png", "台座を調べた");
      }
    });
    mapEl.appendChild(img);
  });
}

// 宝箱配置データ: { [roomKey]: [{ x, y }] }
const boxes = {
  "2,4": [{ x: 2, y: 4 }],
};

function renderBoxes() {
  // 既存の宝箱imgを削除
  const oldBoxes = document.querySelectorAll(".box");
  oldBoxes.forEach((el) => el.remove());
  // 現在の部屋に宝箱があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = `${room.x},${room.y}`;
  const list = boxes[roomKey] || [];
  list.forEach(({ x, y }) => {
    const img = document.createElement("img");
    img.src = "img/UI/box.png";
    img.alt = "宝箱";
    img.className = "box";
    img.style.position = "absolute";
    img.style.left = `${
      SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
    }px`;
    img.style.top = `${
      SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
      (gridSize - 1 - y) * tileSize
    }px`;
    img.style.width = `${tileSize}px`;
    img.style.height = "auto";
    img.style.zIndex = 8;
    img.addEventListener("click", () => {
      // 隣接マスにいる場合のみ反応
      const dx = Math.abs(position.x - x);
      const dy = Math.abs(position.y - y);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        showBoxModal();
      }
    });
    mapEl.appendChild(img);
  });
}

// 進入不可マスデータ: { [roomKey]: [{ x, y, type }] }
const blockedTiles = {
  // 必要に応じて初期値を記述
};

// 宝箱配置時にblockedTilesへ自動追加（全てのboxesデータをblockedTilesに反映）
Object.keys(boxes).forEach((roomKey) => {
  if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
  boxes[roomKey].forEach(({ x, y }) => {
    if (!blockedTiles[roomKey].some((tile) => tile.x === x && tile.y === y)) {
      blockedTiles[roomKey].push({ x, y, type: "box" });
    }
  });
});

// --- 石板調査状態リセット用 ---
function reset() {
  localStorage.removeItem("checkedStoneboards");
  renderStoneboards();
  console.log("石板調査状態をリセットしました。");
}
window.reset = reset;

// --- 画面中央上にリセットボタンを追加 ---
window.addEventListener("DOMContentLoaded", () => {
  // リセットボタン生成
  let resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) {
    resetBtn = document.createElement("button");
    resetBtn.id = "reset-btn";
    resetBtn.textContent = "石板リセット";
    resetBtn.style.position = "fixed";
    resetBtn.style.top = "16px";
    resetBtn.style.left = "50%";
    resetBtn.style.transform = "translateX(-50%)";
    resetBtn.style.zIndex = 1000;
    resetBtn.style.padding = "8px 24px";
    resetBtn.style.fontSize = "1.1rem";
    resetBtn.style.background = "#fff";
    resetBtn.style.border = "1px solid #888";
    resetBtn.style.borderRadius = "8px";
    resetBtn.style.cursor = "pointer";
    resetBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    resetBtn.addEventListener("click", () => window.reset());
    document.body.appendChild(resetBtn);
  }
});

const directions = {
  up: [0, 1],
  down: [0, -1],
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
  renderMinimap();
  // minimap描画
  function renderMinimap() {
    const minimap = document.getElementById("minimap");
    minimap.innerHTML = "";
    // y=0が下、yが大きいほど上になるよう逆順で描画
    for (let y = roomGridSize - 1; y >= 0; y--) {
      for (let x = 0; x < roomGridSize; x++) {
        const cell = document.createElement("div");
        cell.className = "minimap__cell";
        if (visitedRooms[y][x]) cell.classList.add("minimap__cell--visited");
        if (room.x === x && room.y === y)
          cell.classList.add("minimap__cell--current");
        minimap.appendChild(cell);
      }
    }
  }
  const tileSize = setTileSize();
  // 部屋の背景画像切り替え
  const bgImg = mapEl.querySelector(".map__background");
  // 石板・台座の描画は部屋移動時やリサイズ時のみ行う
  // renderStoneboards();
  // renderStands();
  // renderBoxes();
  // どの方向に隣接部屋があるか判定
  const up = room.y < roomGridSize - 1;
  const down = room.y > 0;
  const left = room.x > 0;
  const right = room.x < roomGridSize - 1;
  let key = "";
  if (up) key += "u";
  if (down) key += "d";
  if (right) key += "r";
  if (left) key += "l";
  if (key) {
    bgImg.src = `img/map/map_${key}.webp`;
  } else {
    bgImg.src = "img/UI/background_0.webp";
  }

  // キャラクターの足元がマスの下端に揃うように配置。ただしmapからはみ出さないように制限
  // キャラクター画像の左右をマスの中央に合わせる
  // 端からSAFE_MARGIN分ずらす
  const x =
    SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
    position.x * tileSize +
    (tileSize - characterEl.offsetWidth) / 2;
  // Y軸上向き: 下端がy=0
  let y =
    SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
    (gridSize - 1 - position.y + 1) * tileSize -
    characterEl.offsetHeight;
  characterEl.style.transform = `translate(${x}px, ${y}px)`;
}

// 宝箱用カスタムモーダル表示関数
function showBoxModal() {
  // 既存モーダルがあれば削除
  let old = document.getElementById("box-modal");
  if (old) old.remove();
  // モーダル本体
  const modal = document.createElement("div");
  modal.id = "box-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.4)";
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 2000;

  // 中央パネル
  const panel = document.createElement("div");
  panel.style.background = "#444";
  panel.style.borderRadius = "12px";
  panel.style.padding = "4vw 4vw 2vw 4vw";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.alignItems = "center";
  panel.style.minWidth = "340px";
  panel.style.maxWidth = "90vw";
  panel.style.maxHeight = "90vh";
  panel.style.boxSizing = "border-box";

  // 問題画像
  const img = document.createElement("img");
  img.src = "img/nazo/nazo_1-1-3.png";
  img.alt = "謎画像";
  img.style.maxWidth = "min(60vw, 600px)";
  img.style.maxHeight = "40vh";
  img.style.width = "auto";
  img.style.height = "auto";
  img.style.marginBottom = "24px";
  img.style.borderRadius = "8px";
  panel.appendChild(img);

  // 入力欄と送信ボタンを重ねて配置するラッパー
  const inputWrapContainer = document.createElement("div");
  inputWrapContainer.style.position = "relative";
  inputWrapContainer.style.display = "inline-block";
  inputWrapContainer.style.marginBottom = "24px";
  panel.appendChild(inputWrapContainer);

  // 入力欄（画像のみ）
  const inputWrap = document.createElement("div");
  inputWrap.style.display = "flex";
  inputWrap.style.alignItems = "center";
  inputWrap.style.minHeight = "48px";
  inputWrap.style.background = "#fff";
  inputWrap.style.borderRadius = "6px";
  inputWrap.style.padding = "6px 60px 6px 12px"; // 右側にボタン分の余白
  inputWrap.style.minWidth = "180px";
  inputWrap.id = "box-input-wrap";
  inputWrapContainer.appendChild(inputWrap);

  // 送信ボタン（黄色の円形、入力欄の右中央に重ねる）
  const sendBtn = document.createElement("button");
  sendBtn.innerHTML = "";
  sendBtn.style.width = "44px";
  sendBtn.style.height = "44px";
  sendBtn.style.borderRadius = "50%";
  sendBtn.style.background = "#FFD600";
  sendBtn.style.border = "2px solid #FFC400";
  sendBtn.style.display = "flex";
  sendBtn.style.alignItems = "center";
  sendBtn.style.justifyContent = "center";
  sendBtn.style.fontSize = "1.5rem";
  sendBtn.style.fontWeight = "bold";
  sendBtn.style.cursor = "pointer";
  sendBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
  sendBtn.style.outline = "none";
  sendBtn.style.position = "absolute";
  sendBtn.style.right = "8px";
  sendBtn.style.top = "50%";
  sendBtn.style.transform = "translateY(-50%)";
  inputWrapContainer.appendChild(sendBtn);

  // キーボード
  const keyboard = document.createElement("div");
  keyboard.style.display = "flex";
  keyboard.style.flexDirection = "column";
  keyboard.style.gap = "8px";
  keyboard.style.background = "#222";
  keyboard.style.borderRadius = "8px";
  keyboard.style.padding = "12px 8px";
  keyboard.style.width = "100%";
  keyboard.style.alignItems = "center";

  // キー配列
  const row1 = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const row2 = ["i", "j", "k", "l", "m", "n", "o", "p", "q"];
  const row3 = ["r", "s", "t", "u", "v", "w", "delete"];
  const makeKey = (key) => {
    if (key === "delete") {
      // ボタン要素
      const btn = document.createElement("div");
      btn.style.width = "72px"; // ボタン幅2倍
      btn.style.height = "36px";
      btn.style.display = "flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.background = "#fff";
      btn.style.border = "2px solid #000";
      btn.style.borderRadius = "6px";
      btn.style.boxSizing = "border-box";
      btn.style.margin = "0 4px";
      btn.style.cursor = "pointer";
      // 画像
      const keyImg = document.createElement("img");
      keyImg.src = "img/moji/delete.png";
      keyImg.alt = "delete";
      keyImg.style.width = "36px";
      keyImg.style.height = "36px";
      keyImg.style.display = "block";
      btn.appendChild(keyImg);
      btn.addEventListener("click", () => {
        // 最後の画像を消す
        if (inputWrap.lastChild) inputWrap.removeChild(inputWrap.lastChild);
      });
      return btn;
    } else {
      const keyImg = document.createElement("img");
      keyImg.src = `img/moji/moji${key}.png`;
      keyImg.alt = key;
      keyImg.style.width = "36px";
      keyImg.style.height = "36px";
      keyImg.style.margin = "0 4px";
      keyImg.style.cursor = "pointer";
      keyImg.style.background = "#fff";
      keyImg.style.border = "2px solid #000";
      keyImg.style.borderRadius = "6px";
      keyImg.style.boxSizing = "border-box";
      keyImg.addEventListener("click", () => {
        // 入力欄に画像を追加
        const moji = document.createElement("img");
        moji.src = `img/moji/moji${key}.png`;
        moji.alt = key;
        moji.style.width = "36px";
        moji.style.height = "36px";
        moji.style.margin = "0 2px";
        inputWrap.appendChild(moji);
      });
      return keyImg;
    }
  };
  [row1, row2, row3].forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    row.forEach((key) => rowDiv.appendChild(makeKey(key)));
    keyboard.appendChild(rowDiv);
  });
  panel.appendChild(keyboard);

  // 閉じる処理
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // 送信ボタン押下時の仮動作
  sendBtn.addEventListener("click", () => {
    // 入力された文字列（画像altの連結）を取得
    let answer = "";
    inputWrap.querySelectorAll("img").forEach((img) => (answer += img.alt));
    if (answer === "cbtf") {
      alert("正解！");
      // モーダルを閉じる
      modal.remove();
    } else {
      alert(`入力値: ${answer}`);
    }
  });

  modal.appendChild(panel);
  document.body.appendChild(modal);
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
  // Y軸: 上端はy=gridSize-1, 下端はy=0
  if (nextY > 4 && position.x === 2 && dy === 1 && room.y < roomGridSize - 1) {
    disableCharacterTransition();
    // 上端中央
    room.y += 1;
    nextY = 0;
    nextX = 2;
    movedRoom = true;
    visitedRooms[room.y][room.x] = true;
    renderStoneboards();
    renderStands();
    renderBoxes();
  } else if (nextY < 0 && position.x === 2 && dy === -1 && room.y > 0) {
    disableCharacterTransition();
    // 下端中央
    room.y -= 1;
    nextY = 4;
    nextX = 2;
    movedRoom = true;
    visitedRooms[room.y][room.x] = true;
    renderStoneboards();
    renderStands();
    renderBoxes();
  } else if (nextX < 0 && position.y === 2 && dx === -1 && room.x > 0) {
    disableCharacterTransition();
    // 左端中央
    room.x -= 1;
    nextX = 4;
    nextY = 2;
    movedRoom = true;
    visitedRooms[room.y][room.x] = true;
    renderStoneboards();
    renderStands();
    renderBoxes();
  } else if (
    nextX > 4 &&
    position.y === 2 &&
    dx === 1 &&
    room.x < roomGridSize - 1
  ) {
    disableCharacterTransition();
    // 右端中央
    room.x += 1;
    nextX = 0;
    nextY = 2;
    movedRoom = true;
    visitedRooms[room.y][room.x] = true;
    renderStoneboards();
    renderStands();
    renderBoxes();
  } else if (nextY < 0 && position.x === 2 && dy === 1 && room.y > 0) {
    // 下端中央から下へは移動不可
    return;
  } else if (
    nextY > 4 &&
    position.x === 2 &&
    dy === -1 &&
    room.y < roomGridSize - 1
  ) {
    // 上端中央から上へは移動不可
    return;
  }

  // 通常の範囲内移動
  if (!movedRoom) {
    nextX = clamp(nextX, 0, gridSize - 1);
    nextY = clamp(nextY, 0, gridSize - 1);
    // 進入不可マスなら移動しない
    const roomKey = `${room.x},${room.y}`;
    if (isBlockedTile(roomKey, nextX, nextY)) return;
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

window.addEventListener("resize", () => {
  render();
  renderStoneboards();
  renderStands();
  renderBoxes();
});

render();
renderStoneboards();
renderStands();
renderBoxes();

function isBlockedTile(roomKey, x, y) {
  const list = blockedTiles[roomKey] || [];
  return list.some((tile) => tile.x === x && tile.y === y);
}
