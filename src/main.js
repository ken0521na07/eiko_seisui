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

// 台座に置かれたアイテム: { [roomKey]: { [x,y]: item } }
const standItems = {};

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
        showStandModal(roomKey, x, y);
      }
    });
    mapEl.appendChild(img);
  });
  renderStandItems();
}

// 台座上のアイテムをレンダリング
function renderStandItems() {
  // 既存の台座アイテム画像を削除
  const oldItems = document.querySelectorAll(".stand-item-img");
  oldItems.forEach((el) => el.remove());
  // 現在の部屋のアイテムを描画
  const roomKey = `${room.x},${room.y}`;
  const items = standItems[roomKey] || {};
  Object.entries(items).forEach(([key, item]) => {
    const [x, y] = key.split(",").map(Number);
    addStandItemImage(roomKey, x, y, item);
  });
}

// 台座調査モーダル
function showStandModal(roomKey, x, y) {
  // 既存モーダルがあれば削除
  let old = document.getElementById("stand-modal");
  if (old) old.remove();
  // モーダル本体
  const modal = document.createElement("div");
  modal.id = "stand-modal";
  modal.style.position = "fixed";
  modal.style.left = "0";
  modal.style.right = "0";
  modal.style.bottom = "0";
  modal.style.height = "120px";
  modal.style.background = "rgba(40,40,40,0.98)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 4000;
  // パネル
  const panel = document.createElement("div");
  panel.style.display = "flex";
  panel.style.alignItems = "center";
  panel.style.gap = "32px";
  // テキスト
  const text = document.createElement("div");
  text.textContent = "台座がある。ものを置きますか？";
  text.style.color = "#fff";
  text.style.fontSize = "1.2rem";
  text.style.marginRight = "24px";
  panel.appendChild(text);
  // 「はい」ボタン
  const yesBtn = document.createElement("button");
  yesBtn.textContent = "はい";
  yesBtn.style.marginRight = "12px";
  yesBtn.style.fontSize = "1.1rem";
  yesBtn.style.padding = "8px 24px";
  yesBtn.style.background = "#FFD600";
  yesBtn.style.border = "1px solid #FFC400";
  yesBtn.style.borderRadius = "8px";
  yesBtn.style.cursor = "pointer";
  // 「いいえ」ボタン
  const noBtn = document.createElement("button");
  noBtn.textContent = "いいえ";
  noBtn.style.fontSize = "1.1rem";
  noBtn.style.padding = "8px 24px";
  noBtn.style.background = "#fff";
  noBtn.style.border = "1px solid #888";
  noBtn.style.borderRadius = "8px";
  noBtn.style.cursor = "pointer";
  // ボタン動作
  yesBtn.addEventListener("click", () => {
    modal.remove();
    openStandItemSelect(roomKey, x, y);
  });

  // 台座用アイテム選択画面
  function openStandItemSelect(roomKey, standX, standY) {
    // 既存モーダルがあれば削除
    let old = document.getElementById("item-modal");
    if (old) old.remove();

    // モーダル本体
    const modal = document.createElement("div");
    modal.id = "item-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.4)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = 3000;

    // パネル
    const panel = document.createElement("div");
    panel.style.background = "#444";
    panel.style.borderRadius = "16px";
    panel.style.padding = "32px 40px";
    panel.style.display = "flex";
    panel.style.flexDirection = "row";
    panel.style.gap = "40px";
    panel.style.minWidth = "600px";
    panel.style.maxWidth = "90vw";
    panel.style.maxHeight = "90vh";
    panel.style.boxSizing = "border-box";
    panel.style.position = "relative";

    // 右: アイテム説明
    const descWrap = document.createElement("div");
    descWrap.style.display = "flex";
    descWrap.style.flexDirection = "column";
    descWrap.style.alignItems = "center";
    descWrap.style.justifyContent = "flex-start";
    descWrap.style.minWidth = "220px";
    descWrap.style.maxWidth = "320px";
    descWrap.style.background = "#333";
    descWrap.style.borderRadius = "10px";
    descWrap.style.padding = "24px 18px";
    descWrap.style.boxSizing = "border-box";

    // アイテム名
    const descTitle = document.createElement("div");
    descTitle.style.fontSize = "1.3rem";
    descTitle.style.fontWeight = "bold";
    descTitle.style.color = "#FFD600";
    descTitle.style.marginBottom = "12px";
    descWrap.appendChild(descTitle);
    // アイテム画像
    const descImg = document.createElement("img");
    descImg.style.width = "64px";
    descImg.style.height = "64px";
    descImg.style.marginBottom = "16px";
    descWrap.appendChild(descImg);
    // アイテム説明
    const descText = document.createElement("div");
    descText.style.color = "#fff";
    descText.style.fontSize = "1.1rem";
    descText.style.textAlign = "center";
    descText.style.width = "180px";
    descText.style.wordBreak = "break-word";
    descWrap.appendChild(descText);

    // 左: アイテムグリッド
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(3, 72px)";
    grid.style.gridTemplateRows = "repeat(4, 72px)";
    grid.style.gap = "18px";
    grid.style.background = "#222";
    grid.style.borderRadius = "10px";
    grid.style.padding = "18px";
    grid.style.minWidth = "270px";
    grid.style.alignSelf = "flex-start";

    // unlockedなアイテムのみ表示
    const unlockedItems = itemList.filter((item) => item.unlocked);
    unlockedItems.forEach((item, idx) => {
      const cell = document.createElement("div");
      cell.style.width = "72px";
      cell.style.height = "72px";
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.background = "#fff";
      cell.style.border = "2px solid #888";
      cell.style.borderRadius = "8px";
      cell.style.cursor = "pointer";
      cell.style.transition = "border 0.2s";
      // アイテム画像
      const img = document.createElement("img");
      img.src = item.img;
      img.alt = item.name;
      img.style.width = "48px";
      img.style.height = "48px";
      img.style.opacity = "1";
      cell.appendChild(img);
      // 選択時の処理
      cell.addEventListener("click", () => {
        modal.remove();
        showStandPlaceResult(roomKey, standX, standY, item);
      });
      grid.appendChild(cell);
    });

    // 最初の説明はunlockedな最初のアイテム、なければ空欄
    if (unlockedItems.length > 0) {
      descTitle.textContent = unlockedItems[0].name;
      descImg.src = unlockedItems[0].img;
      descImg.alt = unlockedItems[0].name;
      descText.textContent = unlockedItems[0].desc;
    } else {
      descTitle.textContent = "";
      descImg.src = "";
      descImg.alt = "";
      descText.textContent = "";
    }

    // パネルに左右追加
    panel.appendChild(grid);
    if (unlockedItems.length > 0) {
      panel.appendChild(descWrap);
    }

    // バツボタン
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "16px";
    closeBtn.style.right = "16px";
    closeBtn.style.width = "40px";
    closeBtn.style.height = "40px";
    closeBtn.style.fontSize = "1.7rem";
    closeBtn.style.background = "#fff";
    closeBtn.style.border = "2px solid #888";
    closeBtn.style.borderRadius = "50%";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.zIndex = 10;
    closeBtn.addEventListener("click", () => modal.remove());
    panel.appendChild(closeBtn);

    // モーダル外クリックで閉じる
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.appendChild(panel);
    document.body.appendChild(modal);
  }

  // 台座に置いた結果表示と画像配置
  function showStandPlaceResult(roomKey, standX, standY, item) {
    // standItemsにアイテムを保存
    if (!standItems[roomKey]) standItems[roomKey] = {};
    standItems[roomKey][`${standX},${standY + 1}`] = item;
    // 既存モーダルがあれば削除
    let old = document.getElementById("stand-modal");
    if (old) old.remove();
    // モーダル本体
    const modal = document.createElement("div");
    modal.id = "stand-modal";
    modal.style.position = "fixed";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.height = "100px";
    modal.style.background = "rgba(40,40,40,0.98)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = 4000;
    // テキスト
    const text = document.createElement("div");
    text.textContent = `台座に${item.name}を置いた！`;
    text.style.color = "#FFD600";
    text.style.fontSize = "1.2rem";
    text.style.fontWeight = "bold";
    modal.appendChild(text);
    document.body.appendChild(modal);
    // 台座の一つ上のマスにアイテム画像を表示
    addStandItemImage(roomKey, standX, standY, item);
    // 数秒後に自動で消す
    setTimeout(() => {
      if (modal.parentNode) modal.remove();
    }, 2000);
  }

  // 台座上にアイテム画像を表示
  function addStandItemImage(roomKey, standX, standY, item) {
    // 画像生成
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.className = "stand-item-img";
    img.dataset.room = roomKey;
    img.dataset.x = standX;
    img.dataset.y = standY + 1;
    // 配置
    const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
    img.style.position = "absolute";
    img.style.height = `${tileSize * 0.7}px`;
    img.style.width = "auto";
    // 上下：マスの下端に合わせる
    img.style.top = `${
      SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
      (gridSize - 1 - (standY + 1) + 1) * tileSize -
      tileSize * 0.7
    }px`;
    // 左右：中央揃え
    img.onload = function () {
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
        standX * tileSize +
        (tileSize - img.offsetWidth) / 2
      }px`;
    };
    img.style.zIndex = 9;
    mapEl.appendChild(img);
    // 画像が既に読み込まれていればonloadが発火しないので即時調整
    if (img.complete) {
      img.onload();
    }
  }

  noBtn.addEventListener("click", () => modal.remove());
  panel.appendChild(yesBtn);
  panel.appendChild(noBtn);
  modal.appendChild(panel);
  document.body.appendChild(modal);
}

// 宝箱配置データ: { [roomKey]: [{ x, y, img, answer }] }
const boxes = {
  "2,4": [{ x: 2, y: 4, img: "img/nazo/nazo_1-1-3.png", answer: "cbtf" }],
  "0,2": [{ x: 0, y: 2, img: "img/nazo/nazo_1-1-11.png", answer: "cgsj" }],
  "4,2": [{ x: 4, y: 2, img: "img/nazo/nazo_1-1-15.png", answer: "cjkf" }],
  "2,0": [{ x: 2, y: 0, img: "img/nazo/nazo_1-1-23.png", answer: "cjlm" }],
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
        showBoxModal(roomKey, x, y);
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

// 台座配置時にblockedTilesへ自動追加（全てのstandsデータをblockedTilesに反映）
Object.keys(stands).forEach((roomKey) => {
  if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
  stands[roomKey].forEach(({ x, y }) => {
    if (!blockedTiles[roomKey].some((tile) => tile.x === x && tile.y === y)) {
      blockedTiles[roomKey].push({ x, y, type: "stand" });
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

// --- アイテム画面機能 ---

// アイテムデータ
const itemList = [
  {
    id: "coin",
    name: "コイン",
    img: "img/item/coin.png",
    desc: "ただのコインだ",
    unlocked: false, // 初期は未解放
  },
  {
    id: "tsubo",
    name: "水瓶",
    img: "img/item/tsubo.png",
    desc: "水が入った入れ物だ",
    unlocked: false, // 初期は未解放
  },
  {
    id: "teppan",
    name: "錆びた鉄板",
    img: "img/item/teppan.png",
    desc: "錆びた円形の鉄板だ",
    unlocked: false,
  },
  {
    id: "yasuri",
    name: "やすり",
    img: "img/item/yasuri.png",
    desc: "ただのやすりだ。錆を落とすのに使える。",
    unlocked: false,
  },
  {
    id: "chokinbako",
    name: "貯金箱",
    img: "img/item/chokinbako.png",
    desc: "貯金箱だ。中に何か入っているようだ。",
    unlocked: false,
  },
  // ここに新しいアイテムを追加可能
];

// アイテム解放関数
function unlockItem(id) {
  const item = itemList.find((i) => i.id === id);
  if (item) item.unlocked = true;
}

// アイテム画面モーダル表示関数
function showItemModal() {
  // 既存モーダルがあれば削除
  let old = document.getElementById("item-modal");
  if (old) old.remove();

  // モーダル本体
  const modal = document.createElement("div");
  modal.id = "item-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.4)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 3000;

  // パネル
  const panel = document.createElement("div");
  panel.style.background = "#444";
  panel.style.borderRadius = "16px";
  panel.style.padding = "32px 40px";
  panel.style.display = "flex";
  panel.style.flexDirection = "row";
  panel.style.gap = "40px";
  panel.style.minWidth = "600px";
  panel.style.maxWidth = "90vw";
  panel.style.maxHeight = "90vh";
  panel.style.boxSizing = "border-box";
  panel.style.position = "relative";

  // 右: アイテム説明
  const descWrap = document.createElement("div");
  descWrap.style.display = "flex";
  descWrap.style.flexDirection = "column";
  descWrap.style.alignItems = "center";
  descWrap.style.justifyContent = "flex-start";
  descWrap.style.minWidth = "220px";
  descWrap.style.maxWidth = "320px";
  descWrap.style.background = "#333";
  descWrap.style.borderRadius = "10px";
  descWrap.style.padding = "24px 18px";
  descWrap.style.boxSizing = "border-box";

  // アイテム名
  const descTitle = document.createElement("div");
  descTitle.style.fontSize = "1.3rem";
  descTitle.style.fontWeight = "bold";
  descTitle.style.color = "#FFD600";
  descTitle.style.marginBottom = "12px";
  descWrap.appendChild(descTitle);
  // アイテム画像
  const descImg = document.createElement("img");
  descImg.style.width = "64px";
  descImg.style.height = "64px";
  descImg.style.marginBottom = "16px";
  descWrap.appendChild(descImg);
  // アイテム説明
  const descText = document.createElement("div");
  descText.style.color = "#fff";
  descText.style.fontSize = "1.1rem";
  descText.style.textAlign = "center";
  descText.style.width = "180px";
  descText.style.wordBreak = "break-word";
  descWrap.appendChild(descText);

  // 左: アイテムグリッド
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(3, 72px)";
  grid.style.gridTemplateRows = "repeat(4, 72px)";
  grid.style.gap = "18px";
  grid.style.background = "#222";
  grid.style.borderRadius = "10px";
  grid.style.padding = "18px";
  grid.style.minWidth = "270px";
  grid.style.alignSelf = "flex-start";

  // アイテム画像を並べる
  let selectedIdx = 0;
  // unlockedなアイテムのみ表示
  const unlockedItems = itemList.filter((item) => item.unlocked);
  unlockedItems.forEach((item, idx) => {
    const cell = document.createElement("div");
    cell.style.width = "72px";
    cell.style.height = "72px";
    cell.style.display = "flex";
    cell.style.alignItems = "center";
    cell.style.justifyContent = "center";
    cell.style.background = "#fff";
    cell.style.border =
      selectedIdx === idx ? "3px solid #FFD600" : "2px solid #888";
    cell.style.borderRadius = "8px";
    cell.style.cursor = "pointer";
    cell.style.transition = "border 0.2s";
    // アイテム画像
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.style.width = "48px";
    img.style.height = "48px";
    img.style.opacity = "1";
    cell.appendChild(img);
    // 選択時の処理
    cell.addEventListener("click", () => {
      // 全セルのborderをリセット
      Array.from(grid.children).forEach((c, i) => {
        c.style.border = i === idx ? "3px solid #FFD600" : "2px solid #888";
      });
      // 説明を更新
      descTitle.textContent = item.name;
      descImg.src = item.img;
      descImg.alt = item.name;
      descText.textContent = item.desc;
    });
    grid.appendChild(cell);
  });

  // 最初の説明はunlockedな最初のアイテム、なければ空欄
  if (unlockedItems.length > 0) {
    descTitle.textContent = unlockedItems[0].name;
    descImg.src = unlockedItems[0].img;
    descImg.alt = unlockedItems[0].name;
    descText.textContent = unlockedItems[0].desc;
  } else {
    descTitle.textContent = "";
    descImg.src = "";
    descImg.alt = "";
    descText.textContent = "";
  }

  // パネルに左右追加
  panel.appendChild(grid);
  // unlockedなアイテムがある場合のみ説明欄を表示
  if (unlockedItems.length > 0) {
    panel.appendChild(descWrap);
  }

  // バツボタン
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "16px";
  closeBtn.style.right = "16px";
  closeBtn.style.width = "40px";
  closeBtn.style.height = "40px";
  closeBtn.style.fontSize = "1.7rem";
  closeBtn.style.background = "#fff";
  closeBtn.style.border = "2px solid #888";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.zIndex = 10;
  closeBtn.addEventListener("click", () => modal.remove());
  panel.appendChild(closeBtn);

  // モーダル外クリックで閉じる
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.appendChild(panel);
  document.body.appendChild(modal);
}

// 画面右上に「アイテム」ボタンを追加
window.addEventListener("DOMContentLoaded", () => {
  let itemBtn = document.getElementById("item-btn");
  if (!itemBtn) {
    itemBtn = document.createElement("button");
    itemBtn.id = "item-btn";
    itemBtn.textContent = "アイテム";
    itemBtn.style.position = "fixed";
    itemBtn.style.top = "18px";
    itemBtn.style.right = "24px";
    itemBtn.style.zIndex = 1200;
    itemBtn.style.padding = "8px 24px";
    itemBtn.style.fontSize = "1.1rem";
    itemBtn.style.background = "#fff";
    itemBtn.style.border = "1px solid #888";
    itemBtn.style.borderRadius = "8px";
    itemBtn.style.cursor = "pointer";
    itemBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    itemBtn.addEventListener("click", showItemModal);
    document.body.appendChild(itemBtn);
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
function showBoxModal(
  roomKey = `${room.x},${room.y}`,
  boxX = position.x,
  boxY = position.y
) {
  // 既存モーダルがあれば削除
  let old = document.getElementById("box-modal");
  if (old) old.remove();
  // 対象宝箱データ取得
  const boxList = boxes[roomKey] || [];
  const box = boxList.find((b) => b.x === boxX && b.y === boxY) || boxList[0];
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
  img.src = box?.img || "img/nazo/nazo_1-1-3.png";
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
    // 現在の部屋・宝箱の正解を取得
    const correct = box?.answer || "";
    // 正解時のアイテム解放処理
    if (answer === correct && roomKey === "2,4") {
      unlockItem("tsubo");
      showModal(
        "img/item/tsubo.png",
        "宝箱が開いた！\n中から「水瓶」を手に入れた！"
      );
      modal.remove();
    } else if (answer === correct && roomKey === "0,2") {
      unlockItem("teppan");
      showModal(
        "img/item/teppan.png",
        "宝箱が開いた！\n中から「錆びた鉄板」を手に入れた！"
      );
      modal.remove();
    } else if (answer === correct && roomKey === "4,2") {
      unlockItem("yasuri");
      showModal(
        "img/item/yasuri.png",
        "宝箱が開いた！\n中から「やすり」を手に入れた！"
      );
      modal.remove();
    } else if (answer === correct && roomKey === "2,0") {
      unlockItem("chokinbako");
      showModal(
        "img/item/chokinbako.png",
        "宝箱が開いた！\n中から「貯金箱」を手に入れた！"
      );
      modal.remove();
    } else if (answer === correct) {
      alert("正解！");
      modal.remove();
    } else {
      alert("どうやら答えが違うようだ。");
      // 入力欄を空にする
      while (inputWrap.firstChild) inputWrap.removeChild(inputWrap.firstChild);
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
    renderStandItems();
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
    renderStandItems();
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
    renderStandItems();
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
