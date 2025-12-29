// ===== UI描画とモーダル機能 =====

import {
  gridSize,
  MAP_PX,
  SAFE_MARGIN,
  PLAYABLE_PX,
  clamp,
} from "./constants.js";
import {
  mapEl,
  characterEl,
  position,
  room,
  getRoomKey,
  getRoomGridSize,
  magicCircleStates,
  stoneboardElements,
  buttonElements,
  normalMagicCircleElements,
  magicCircleElements,
  standItems,
  visitedRooms,
  roomBlackout,
} from "./state.js";
import {
  getCheckedStoneboards,
  setCheckedStoneboard,
  isCheckedStoneboard,
  getOpenedBoxes,
  setOpenedBox,
  isOpenedBox,
  getBoxOpenOrder,
  addBoxOpenOrder,
  resetBoxOpenOrder,
  checkBoxOpenSequence,
  getFloor2CenterUnlocked,
  saveStandItems,
  saveGameState,
} from "./storage.js";
import {
  stoneboards,
  magicCircles,
  buttons_data,
  normalMagicCircles,
  stands,
  boxes,
  boxPaperRewards,
  ladders,
  itemList,
  itemCombinations,
  blockedTiles,
  jewelries,
} from "./config.js";
import {
  unlockItem,
  removeItem,
  unlockLadder,
  getPlacedItemIds,
  showStandItemImage,
} from "./utils.js";

// 共通下部モーダル
// options: { text, yes, no, close }
export function showBottomModal(options) {
  // 既存モーダル・オーバーレイがあれば削除
  let old = document.getElementById("bottom-modal");
  if (old) old.remove();
  let oldOverlay = document.getElementById("bottom-modal-overlay");
  if (oldOverlay) oldOverlay.remove();

  // オーバーレイ生成
  const overlay = document.createElement("div");
  overlay.id = "bottom-modal-overlay";
  overlay.className = "bottom-modal-overlay";
  document.body.appendChild(overlay);
  // モーダル本体
  const modal = document.createElement("div");
  modal.id = "bottom-modal";
  modal.className = "stand-modal";
  // パネル
  const panel = document.createElement("div");
  panel.className = "panel";
  // テキスト
  const text = document.createElement("div");
  text.className = "text";
  text.textContent = options.text || "";
  panel.appendChild(text);
  // ボタン
  if (options.yes || options.no) {
    // はい・いいえ型
    const yesBtn = document.createElement("button");
    yesBtn.textContent = "はい";
    yesBtn.className = "yes";
    yesBtn.addEventListener("click", () => {
      modal.remove();
      if (options.yes) options.yes();
    });
    const noBtn = document.createElement("button");
    noBtn.textContent = "いいえ";
    noBtn.className = "no";
    noBtn.addEventListener("click", () => {
      modal.remove();
      if (options.no) options.no();
    });
    panel.appendChild(yesBtn);
    panel.appendChild(noBtn);
  } else {
    // 閉じるだけ型
    const closeBtn = document.createElement("button");
    closeBtn.textContent = options.buttonText || "閉じる";
    closeBtn.className = "close";
    closeBtn.addEventListener("click", () => {
      modal.remove();
      if (options.close) options.close();
    });
    panel.appendChild(closeBtn);
  }
  modal.appendChild(panel);
  document.body.appendChild(modal);

  // モーダルを閉じるときはオーバーレイも削除
  function removeModalAndOverlay() {
    modal.remove();
    overlay.remove();
  }
  // ボタンのイベントを上書き
  const yesBtn = modal.querySelector("button");
  if (yesBtn) {
    yesBtn.onclick = () => {
      removeModalAndOverlay();
      if (options.yes) options.yes();
    };
  }
  const noBtn = modal.querySelectorAll("button")[1];
  if (noBtn) {
    noBtn.onclick = () => {
      removeModalAndOverlay();
      if (options.no) options.no();
    };
  }
  const closeBtn = modal.querySelector("button");
  if (closeBtn && !options.yes && !options.no) {
    closeBtn.onclick = () => {
      removeModalAndOverlay();
      if (options.close) options.close();
    };
  }
}

// モーダル表示関数
export function showModal(imgSrc, text, onClose) {
  // 画像のみ中央モーダルで表示
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  modalImg.src = imgSrc;
  modal.style.display = "flex";

  // テキストは下部モーダルで表示
  showBottomModal({
    text: text,
    close: () => {
      modal.style.display = "none";
      if (typeof onClose === "function") onClose();
    },
  });
}

// ハシゴ描画
export function renderLadder() {
  // 既存のハシゴを削除
  const oldLadders = document.querySelectorAll(".ladder");
  oldLadders.forEach((el) => el.remove());

  const roomKey = getRoomKey();
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;

  // 現在の部屋にあるハシゴを描画
  const roomLadders = ladders.filter(
    (ladder) => ladder.roomKey === roomKey && ladder.unlocked
  );

  roomLadders.forEach((ladder) => {
    const img = document.createElement("img");
    // 方向に応じて画像を切り替え
    img.src =
      ladder.direction === "down"
        ? "img/UI/ladder_down.png"
        : "img/UI/ladder.png";
    img.alt = "ハシゴ";
    img.className = "ladder";
    img.style.position = "absolute";
    img.style.height = `${tileSize}px`;
    img.style.width = "auto";

    // 上下中央揃え
    img.style.top = `${
      SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
      (gridSize - 1 - ladder.y) * tileSize
    }px`;

    // 左右中央揃え（画像読み込み後に調整）
    img.onload = function () {
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
        ladder.x * tileSize +
        (tileSize - img.offsetWidth) / 2
      }px`;
    };

    img.style.zIndex = 6;
    mapEl.appendChild(img);

    // 既に読み込まれている場合は即座に調整
    if (img.complete) {
      img.onload();
    }
  });
}

export function renderStoneboards() {
  // 既存の石板imgを削除
  stoneboardElements.forEach((el) => el.remove());
  stoneboardElements.length = 0;

  // 現在の部屋に石板があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
  const boards = stoneboards[roomKey] || [];
  boards.forEach(({ x, y, img: imgName, direction, frame, frameImg }) => {
    const img = document.createElement("img");
    // フレーム画像の選択（デフォルト: stoneboard）
    if (frameImg) {
      img.src = frameImg;
    } else if (frame === "window") {
      img.src = "img/UI/window.png";
    } else {
      img.src = "img/UI/stoneboard.png";
    }
    img.alt = "石板";
    img.className = "stoneboard";
    img.style.position = "absolute";
    const boardWidth = tileSize;
    const boardHeight = tileSize * (117 / 501);
    img.style.width = `${boardWidth}px`;
    img.style.height = `${boardHeight}px`;
    // 向きに応じて配置
    if (direction === "up") {
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
      }px`;
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y) * tileSize
      }px`;
      img.style.transform = "";
    } else if (direction === "down") {
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
      }px`;
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y + 1) * tileSize -
        boardHeight
      }px`;
      img.style.transform = "";
    } else if (direction === "left") {
      img.style.left = `${SAFE_MARGIN * (mapEl.clientWidth / MAP_PX)}px`;
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - y + 0.5) * tileSize -
        boardWidth / 2
      }px`;
      img.style.transform = "rotate(270deg)";
      img.style.transformOrigin = "left top";
    } else if (direction === "right") {
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + (gridSize - 1) * tileSize
      }px`;
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - y + 0.5) * tileSize -
        boardWidth / 2
      }px`;
      img.style.transform = "rotate(90deg)";
      img.style.transformOrigin = "right top";
    } else {
      // デフォルトはdown
      img.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
      }px`;
      img.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y + 1) * tileSize -
        boardHeight
      }px`;
      img.style.transform = "";
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
        let message = "壁に何か書かれている";
        if (frame === "window") {
          message = "窓から外の様子が見える";
        } else if (roomKey === "1,1,1,1" || roomKey === "1,1,2,1") {
          message =
            "石板に謎のようなものが書かれている。\n解き明かすと、次の道が開けそうだ。";
        }
        showModal(`img/nazo/${imgName}`, message);
        setCheckedStoneboard(roomKey, x, y);
        renderStoneboards(); // 状態更新
      }
    });
    mapEl.appendChild(img);
    stoneboardElements.push(img);
  });
}

export function renderMagicCircles() {
  // 既存の魔法陣imgを削除
  magicCircleElements.forEach((el) => el.remove());
  magicCircleElements.length = 0;

  // 現在の部屋に魔法陣があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
  const circles = magicCircles[roomKey] || [];
  circles.forEach(({ x, y, width, height, state: defaultState }) => {
    const img = document.createElement("img");
    // 状態に応じた画像を選択
    const currentState = magicCircleStates[roomKey] || defaultState || "white";
    let imageSrc = "img/UI/circle_white.png";
    if (currentState === "blue") imageSrc = "img/UI/circle_blue.png";
    if (currentState === "red") imageSrc = "img/UI/circle_red.png";
    img.src = imageSrc;
    img.alt = "魔法陣";
    img.className = "magic-circle";
    img.style.position = "absolute";
    // 魔法陣の中央がマップ中央に来るように配置
    const circleWidthPx = width * tileSize;
    const circleHeightPx = height * tileSize;
    img.style.width = `${circleWidthPx}px`;
    img.style.height = `${circleHeightPx}px`;
    // 画像の中央を部屋の中央に合わせる
    const mapCenterX =
      SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + (gridSize / 2) * tileSize;
    const mapCenterY =
      SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) + (gridSize / 2) * tileSize;
    img.style.left = `${mapCenterX - circleWidthPx / 2}px`;
    img.style.top = `${mapCenterY - circleHeightPx / 2}px`;
    img.style.zIndex = 6;
    mapEl.appendChild(img);
    magicCircleElements.push(img);
  });
}

export function renderNormalMagicCircles() {
  // 既存の普通の魔法陣imgを削除
  normalMagicCircleElements.forEach((el) => el.remove());
  normalMagicCircleElements.length = 0;

  // 現在の部屋に魔法陣があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
  const circles = normalMagicCircles[roomKey] || [];
  circles.forEach(({ width, height, img: overrideImg }) => {
    const img = document.createElement("img");
    img.src = overrideImg || "img/UI/mahoujin.png";
    img.alt = "魔法陣";
    img.className = "normal-magic-circle";
    img.style.position = "absolute";
    // 魔法陣の中央がマップ中央に来るように配置
    const circleWidthPx = width * tileSize;
    const circleHeightPx = height * tileSize;
    img.style.width = `${circleWidthPx}px`;
    img.style.height = `${circleHeightPx}px`;
    // 画像の中央を部屋の中央に合わせる
    const mapCenterX =
      SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + (gridSize / 2) * tileSize;
    const mapCenterY =
      SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) + (gridSize / 2) * tileSize;
    img.style.left = `${mapCenterX - circleWidthPx / 2}px`;
    img.style.top = `${mapCenterY - circleHeightPx / 2}px`;
    img.style.zIndex = 5;
    mapEl.appendChild(img);
    normalMagicCircleElements.push(img);
  });
}

export function renderButtons() {
  // 既存のボタンimgを削除
  buttonElements.forEach((el) => el.remove());
  buttonElements.length = 0;

  // 現在の部屋にボタンがあれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
  const btns = buttons_data[roomKey] || [];
  const currentState = magicCircleStates[roomKey];
  const isLocked = currentState === "red" || currentState === "blue";
  btns.forEach(
    ({ x, y, color, img: customImg, action, targets, targetRoomKey }) => {
      const buttonImg = document.createElement("img");
      // カスタム画像がある場合はそれを使用
      if (customImg) {
        buttonImg.src = customImg;
        buttonImg.alt = "ボタン";
      } else {
        // 押せないときは_pushed画像
        if (isLocked) {
          buttonImg.src =
            color === "red"
              ? "img/UI/button_red_pushed.png"
              : "img/UI/button_blue_pushed.png";
        } else {
          buttonImg.src =
            color === "red"
              ? "img/UI/button_red.png"
              : "img/UI/button_blue.png";
        }
        buttonImg.alt = color === "red" ? "赤いボタン" : "青いボタン";
      }
      buttonImg.className = "button";
      buttonImg.style.position = "absolute";
      buttonImg.style.left = `${
        SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) + x * tileSize
      }px`;
      buttonImg.style.top = `${
        SAFE_MARGIN * (mapEl.clientHeight / MAP_PX) +
        (gridSize - 1 - y) * tileSize
      }px`;
      buttonImg.style.height = `${tileSize * 0.9}px`;
      buttonImg.style.width = "auto";
      // 左右中央揃え
      buttonImg.onload = function () {
        buttonImg.style.left = `${
          SAFE_MARGIN * (mapEl.clientWidth / MAP_PX) +
          x * tileSize +
          (tileSize - buttonImg.offsetWidth) / 2
        }px`;
      };
      buttonImg.style.zIndex = 7;
      // 押せるときのみイベント付与（カスタムボタンはロック判定なし）
      if (customImg || !isLocked) {
        buttonImg.addEventListener("click", () => {
          // 隣接マスにいる場合のみ反応
          const dx = Math.abs(position.x - x);
          const dy = Math.abs(position.y - y);
          if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            if (customImg && action) {
              // カスタムボタンのアクション実行
              handleButtonAction(action, { targets, roomKey, targetRoomKey });
            } else {
              // 通常のボタン
              showButtonModal(roomKey, x, y, color);
            }
          }
        });
      }
      mapEl.appendChild(buttonImg);
      buttonElements.push(buttonImg);
    }
  );
}

function handleButtonAction(action, opts = {}) {
  if (action === "warp") {
    // ワープ先の指定（"x,y,floor,mapnum"）
    const { targetRoomKey } = opts;
    const destKey = targetRoomKey || "0,0,2,2"; // 互換のためデフォルト維持
    const [dx, dy, dfloor, dmapnum] = destKey.split(",").map(Number);
    room.mapnum = dmapnum;
    room.floor = dfloor;
    room.x = dx;
    room.y = dy;
    // 位置は固定(2,2)
    position.x = 2;
    position.y = 2;
    // 訪問済み管理
    const gridSize = getRoomGridSize(room.floor);
    if (!visitedRooms[room.mapnum]) visitedRooms[room.mapnum] = {};
    if (!visitedRooms[room.mapnum][room.floor]) {
      visitedRooms[room.mapnum][room.floor] = Array.from(
        { length: gridSize },
        () => Array(gridSize).fill(false)
      );
    }
    visitedRooms[room.mapnum][room.floor][room.y][room.x] = true;
    // 再描画と保存
    renderGame();
    saveGameState(position, room, visitedRooms, magicCircleStates);
    // メッセージ表示
    showBottomModal({ text: "隣のピラミッドにワープしたようだ" });
  } else if (action === "unlockLadders") {
    const { targets = [] } = opts;
    targets.forEach((rk) => unlockLadder(rk));
    renderLadder();
    showBottomModal({ text: "ハシゴが解放された。" });
  }
}

export function renderStands() {
  // 既存の台座imgを削除
  const oldStands = document.querySelectorAll(".stand");
  oldStands.forEach((el) => el.remove());
  // 現在の部屋に台座があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
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

export function renderStandItems() {
  // 既存の台座アイテム画像を削除
  const oldItems = document.querySelectorAll(".stand-item-img");
  oldItems.forEach((el) => el.remove());
  // 現在の部屋のアイテムを描画
  const roomKey = getRoomKey();
  const items = standItems[roomKey] || {};
  const hasStandAt = (rk, sx, sy) =>
    (stands[rk] || []).some((s) => s.x === sx && s.y === sy);
  Object.entries(items).forEach(([key, item]) => {
    const [x, yStored] = key.split(",").map(Number);
    // 旧データ(yStoredが台座の一つ上)を新形式(台座座標)に補正して描画
    const standY = hasStandAt(roomKey, x, yStored)
      ? yStored
      : hasStandAt(roomKey, x, yStored - 1)
      ? yStored - 1
      : yStored;
    showStandItemImage(roomKey, x, standY, item);
  });
}

export function renderBoxes() {
  // 既存の宝箱imgを削除
  const oldBoxes = document.querySelectorAll(".box");
  oldBoxes.forEach((el) => el.remove());
  // 現在の部屋に宝箱があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
  const list = boxes[roomKey] || [];
  list.forEach(({ x, y }) => {
    const opened = isOpenedBox(roomKey, x, y);
    const img = document.createElement("img");
    img.src = opened ? "img/UI/box_opened.png" : "img/UI/box.png";
    img.alt = opened ? "開いた宝箱" : "宝箱";
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
    const enableClick = () => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        // 隣接マスにいる場合のみ反応
        const dx = Math.abs(position.x - x);
        const dy = Math.abs(position.y - y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
          showBoxModal(roomKey, x, y);
        }
      });
    };

    if (!opened) {
      enableClick();
    } else {
      img.style.opacity = "0.7";
      // 2Fの紙表示付き宝箱は開封後も閲覧可能にする
      if (boxPaperRewards[roomKey]) {
        enableClick();
      } else {
        img.style.cursor = "default";
      }
    }
    mapEl.appendChild(img);
  });
}

export function renderJewelries() {
  // 既存の宝石imgを削除
  const oldJewelries = document.querySelectorAll(".jewelry");
  oldJewelries.forEach((el) => el.remove());
  // 現在の部屋に宝石があれば描画
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  const roomKey = getRoomKey();
  const list = jewelries[roomKey] || [];
  list.forEach(({ x, y, img: imgSrc }) => {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "宝石";
    img.className = "jewelry";
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
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      // 隣接マスにいる場合のみ反応
      const dx = Math.abs(position.x - x);
      const dy = Math.abs(position.y - y);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        showJewelryModal();
      }
    });
    mapEl.appendChild(img);
  });
}

function showJewelryModal() {
  showBottomModal({
    text: "とても高価そうな宝石が台座に飾られている。手に入れますか？",
    yes: () => {
      showBottomModal({
        text: "クリア！",
        close: () => {},
      });
    },
    no: () => {},
  });
}

function showStandModal(roomKey, x, y) {
  // 台座上にアイテムがあるか判定
  const items = standItems[roomKey] || {};
  // 互換対応: 新( x,y ) / 旧( x,y+1 ) どちらでも拾う
  const placedItem = items[`${x},${y}`] || items[`${x},${y + 1}`];
  if (placedItem) {
    showStandRetrieveModal(roomKey, x, y, placedItem);
    return;
  }
  showBottomModal({
    text: "台座がある。ものを置きますか？",
    yes: () => openStandItemSelect(roomKey, x, y),
    no: () => {},
  });
}

function showStandRetrieveModal(roomKey, x, y, item) {
  showBottomModal({
    text: `台座には${item.name}が置かれている。カバンに戻しますか？`,
    yes: () => retrieveStandItem(roomKey, x, y, item),
    no: () => {},
  });
}

function retrieveStandItem(roomKey, x, y, item) {
  // 台座上のアイテムを削除
  if (standItems[roomKey]) {
    // 新旧どちらのキーでも削除
    if (standItems[roomKey][`${x},${y}`]) {
      delete standItems[roomKey][`${x},${y}`];
    } else if (standItems[roomKey][`${x},${y + 1}`]) {
      delete standItems[roomKey][`${x},${y + 1}`];
    }
    saveStandItems();
  }
  // アイテムをカバン（unlocked）に戻す
  unlockItem(item.id);
  // UI更新
  renderStandItems();
  // 回収メッセージ
  showBottomModal({
    text: `${item.name}をカバンに戻した。`,
    close: () => {},
  });
}

function openStandItemSelect(roomKey, standX, standY) {
  // 既存モーダルがあれば削除
  let old = document.getElementById("item-modal");
  if (old) old.remove();

  // モーダル本体
  const modal = document.createElement("div");
  modal.id = "item-modal";
  modal.className = "item-select-modal";

  // パネル
  const panel = document.createElement("div");
  panel.className = "item-select-panel";

  // 右: アイテム説明
  const descWrap = document.createElement("div");
  descWrap.className = "item-select-desc";

  // アイテム名
  const descTitle = document.createElement("div");
  descTitle.className = "item-select-desc__title";
  descWrap.appendChild(descTitle);
  // アイテム画像
  const descImg = document.createElement("img");
  descImg.className = "item-select-desc__img";
  descWrap.appendChild(descImg);
  // アイテム説明
  const descText = document.createElement("div");
  descText.className = "item-select-desc__text";
  descWrap.appendChild(descText);

  // 左: アイテムグリッド
  const grid = document.createElement("div");
  grid.className = "item-select-grid";

  // unlockedかつ台座に置かれていないアイテムのみ表示
  const placedIds = getPlacedItemIds();
  const unlockedItems = itemList.filter(
    (item) => item.unlocked && !placedIds.includes(item.id)
  );
  unlockedItems.forEach((item, idx) => {
    const cell = document.createElement("div");
    cell.className = "item-select-cell";
    // アイテム画像
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.className = "item-select-cell__img";
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
  closeBtn.className = "item-select-close";
  closeBtn.addEventListener("click", () => modal.remove());
  panel.appendChild(closeBtn);

  modal.appendChild(panel);
  document.body.appendChild(modal);
}

function showStandPlaceResult(roomKey, standX, standY, item) {
  // standItemsにアイテムを保存
  if (!standItems[roomKey]) standItems[roomKey] = {};
  // 新形式: 台座の座標(standX, standY)で保存
  standItems[roomKey][`${standX},${standY}`] = item;
  saveStandItems();
  // 台座の一つ上のマスにアイテム画像を表示
  showStandItemImage(roomKey, standX, standY, item);

  // 特定条件チェック: "2,2,1,1"にコイン、"3,1,1,1"に鏡
  const checkSpecialCondition = () => {
    const hasCoinAt22 =
      standItems["2,2,1,1"] &&
      Object.values(standItems["2,2,1,1"]).some((i) => i.id === "coin");
    const hasMirrorAt31 =
      standItems["3,1,1,1"] &&
      Object.values(standItems["3,1,1,1"]).some((i) => i.id === "mirror");
    return hasCoinAt22 && hasMirrorAt31;
  };

  // showBottomModalでメッセージ表示
  showBottomModal({
    text: `台座に${item.name}を置いた！`,
    close: () => {
      // 条件達成時に追加メッセージ
      if (checkSpecialCondition()) {
        // ハシゴを出現させる
        unlockLadder("1,1,1,1");
        renderLadder();

        showBottomModal({
          text: "どこかで何かが変化したようだ",
          close: () => {},
        });
      }
      // 新条件: 「1,2,1,2」の台座に「水瓶」を置いたら、
      //         「3,1,0,2」のハシゴを解放し、テキストを表示
      if (roomKey === "1,2,1,2" && item.id === "tsubo") {
        unlockLadder("3,1,0,2");
        renderLadder();
        showBottomModal({
          text: "どこかで何かが変化したようだ",
          close: () => {},
        });
      }
    },
  });
}

function showButtonModal(roomKey, x, y, color = "blue") {
  // 既存モーダルがあれば削除
  let old = document.getElementById("button-modal");
  if (old) old.remove();
  showBottomModal({
    text:
      color === "red"
        ? "赤いスイッチがある。押しますか？"
        : "青いスイッチがある。押しますか？",
    yes: () => {
      magicCircleStates[roomKey] = color;
      saveGameState(position, room, visitedRooms, magicCircleStates);
      // 魔法陣が赤/青の間は中央3x3マス進入不可
      setMagicCircleBlock(roomKey, true);
      renderMagicCircles();
      renderButtons();
      // 5秒後に白に戻す
      setTimeout(() => {
        magicCircleStates[roomKey] = "white";
        saveGameState(position, room, visitedRooms, magicCircleStates);
        setMagicCircleBlock(roomKey, false);
        renderMagicCircles();
        renderButtons();
      }, 5000);
      // 3,3部屋の中央に貯金箱が置かれている場合の特別演出
      if (
        roomKey === "3,3,1,1" &&
        color === "red" &&
        standItems[roomKey] &&
        standItems[roomKey]["2,2"] &&
        standItems[roomKey]["2,2"].id === "chokinbako"
      ) {
        // 先に熱気のテキストを表示し、閉じたら処理を実行
        showBottomModal({
          text: "円から、燃えるような熱気が放たれている。触れたら焼けてしまいそうだ。",
          close: () => {
            // 貯金箱を消し、コインを入手
            delete standItems[roomKey]["2,2"];
            saveStandItems();
            renderStandItems();
            removeItem("chokinbako");
            unlockItem("coin");
            // 貯金箱が燃えた演出を挟む
            showBottomModal({
              text: "貯金箱が燃え、中から「コイン」が出てきた！",
              close: () => {
                showModal("img/item/coin.png", "「コイン」を手に入れた！");
              },
            });
          },
        });
        return;
      }
      showBottomModal({
        text:
          color === "red"
            ? "円から、燃えるような熱気が放たれている。触れたら焼けてしまいそうだ。"
            : "円から、凍てつような冷気が放たれている。触れたら凍ってしまいそうだ。",
      });
    },
    no: () => {},
  });

  function setMagicCircleBlock(roomKey, block) {
    // 中央3x3マス(x:1-3, y:1-3)
    if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
    for (let x = 1; x <= 3; x++) {
      for (let y = 1; y <= 3; y++) {
        const idx = blockedTiles[roomKey].findIndex(
          (t) => t.x === x && t.y === y && t.type === "magiccircle"
        );
        if (block) {
          if (idx === -1)
            blockedTiles[roomKey].push({ x, y, type: "magiccircle" });
        } else {
          if (idx !== -1) blockedTiles[roomKey].splice(idx, 1);
        }
      }
    }
  }
}

export function showBoxModal(
  roomKey = `${room.x},${room.y}`,
  boxX = position.x,
  boxY = position.y
) {
  // 既に開封済みなら、2Fの紙（あれば）を表示して終了
  if (isOpenedBox(roomKey, boxX, boxY)) {
    if (boxPaperRewards[roomKey]) {
      const paperImg = boxPaperRewards[roomKey];
      showModal(paperImg, "宝箱が開いた！中には一枚の紙が貼られている。");
    }
    return;
  }
  // 未開封の場合は、先に説明用のボトムモーダルを表示
  showBottomModal({
    text: "謎を解けば、宝箱が開きそうだ。",
    buttonText: "次へ",
    close: () => {
      // ボトムモーダルを閉じたらキーボード画面を表示
      showBoxChallenge(roomKey, boxX, boxY);
    },
  });
}

export function showBoxChallenge(
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
  modal.className = "box-modal";

  // 中央パネル
  const panel = document.createElement("div");
  panel.className = "box-modal__panel";

  // 問題画像
  const img = document.createElement("img");
  img.src = box?.img || "img/nazo/nazo_1-1-3.png";
  img.alt = "謎画像";
  img.className = "box-modal__img";
  panel.appendChild(img);

  // 入力欄と送信ボタンを重ねて配置するラッパー
  const inputWrapContainer = document.createElement("div");
  inputWrapContainer.className = "box-modal__input-wrap-container";
  panel.appendChild(inputWrapContainer);

  // 入力欄（画像のみ）
  const inputWrap = document.createElement("div");
  inputWrap.className = "box-modal__input-wrap";
  inputWrap.id = "box-input-wrap";
  inputWrapContainer.appendChild(inputWrap);

  // 送信ボタン（黄色の円形、入力欄の右中央に重ねる）
  const sendBtn = document.createElement("button");
  sendBtn.innerHTML = "";
  sendBtn.className = "box-modal__send-btn";
  inputWrapContainer.appendChild(sendBtn);

  // キーボード
  const keyboard = document.createElement("div");
  keyboard.className = "box-modal__keyboard";

  // キー配列
  const row1 = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const row2 = ["i", "j", "k", "l", "m", "n", "o", "p", "q"];
  const row3 = ["r", "s", "t", "u", "v", "w", "delete"];
  const makeKey = (key) => {
    if (key === "delete") {
      // ボタン要素
      const btn = document.createElement("div");
      btn.className = "box-modal__key--delete";
      // 画像
      const keyImg = document.createElement("img");
      keyImg.src = "img/moji/delete.png";
      keyImg.alt = "delete";
      keyImg.className = "box-modal__delete-icon";
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
      keyImg.className = "box-modal__key";
      keyImg.addEventListener("click", () => {
        // 入力欄に画像を追加
        const moji = document.createElement("img");
        moji.src = `img/moji/moji${key}.png`;
        moji.alt = key;
        moji.className = "box-modal__moji";
        inputWrap.appendChild(moji);
      });
      return keyImg;
    }
  };
  [row1, row2, row3].forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "box-modal__key-row";
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
    if (answer === correct) {
      setOpenedBox(roomKey, boxX, boxY);
      renderBoxes();
      if (roomKey === "2,4,1,1") {
        unlockItem("tsubo");
        showModal(
          "img/item/tsubo.png",
          "宝箱が開いた！\n中から「水瓶」を手に入れた！"
        );
      } else if (roomKey === "0,2,1,1") {
        unlockItem("teppan");
        showModal(
          "img/item/teppan.png",
          "宝箱が開いた！\n中から「錆びた鉄板」を手に入れた！"
        );
      } else if (roomKey === "4,2,1,1") {
        unlockItem("yasuri");
        showModal(
          "img/item/yasuri.png",
          "宝箱が開いた！\n中から「やすり」を手に入れた！"
        );
      } else if (roomKey === "2,0,1,1") {
        unlockItem("chokinbako");
        showModal(
          "img/item/chokinbako.png",
          "宝箱が開いた！\n中から「貯金箱」を手に入れた！"
        );
      } else if (boxPaperRewards[roomKey]) {
        const paperImg = boxPaperRewards[roomKey];
        // 2F宝箱の場合は開封順序を記録
        addBoxOpenOrder(roomKey);
        const openOrder = getBoxOpenOrder();

        // 4個目の宝箱を開けた場合は順序判定
        if (openOrder.length === 4) {
          const isCorrect = checkBoxOpenSequence();
          showModal(
            paperImg,
            "宝箱が開いた！中には一枚の紙が貼られている。",
            () => {
              if (isCorrect) {
                // 正解: 2F→3Fハシゴを出現させる
                unlockLadder("1,1,2,1");
                renderLadder();
                showBottomModal({
                  text: "どこかで何かが変化したようだ。",
                  close: () => {},
                });
              } else {
                // 不正解: 2Fの宝箱を全てリセット
                const opened = getOpenedBoxes();
                const boxKeys2F = ["1,2,2,1", "0,1,2,1", "2,1,2,1", "1,0,2,1"];
                boxKeys2F.forEach((key) => {
                  if (opened[key]) {
                    delete opened[key];
                  }
                });
                localStorage.setItem("openedBoxes", JSON.stringify(opened));
                resetBoxOpenOrder();
                renderBoxes();
                showBottomModal({
                  text: "全ての宝箱が閉まったようだ。",
                  close: () => {},
                });
              }
            }
          );
        } else {
          showModal(paperImg, "宝箱が開いた！中には一枚の紙が貼られている。");
        }
      } else if (roomKey === "0,0,3,1") {
        unlockItem("redkey");
        showModal(
          "img/item/redkey.png",
          "宝箱が開いた！\n中から「赤い鍵」を手に入れた！"
        );
      } else {
        alert("正解！");
      }
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

export function setTileSize() {
  // プレイ可能領域をgridで割る
  const tileSize = (mapEl.clientHeight * PLAYABLE_PX) / MAP_PX / gridSize;
  mapEl.style.setProperty("--tile-size", `${tileSize}px`);
  // widthはCSSのaspect-ratioで自動調整、heightのみ指定
  characterEl.style.height = `${tileSize}px`;
  characterEl.style.width = "auto";
  return tileSize;
}

export function render() {
  renderMinimap();
  // minimap描画
  function renderMinimap() {
    const minimap = document.getElementById("minimap");
    minimap.innerHTML = "";
    // 現在のmapnumとfloorのデータを取得
    const currentGridSize = getRoomGridSize(room.floor);
    // ミニマップのグリッドサイズを動的に設定
    minimap.style.gridTemplateColumns = `repeat(${currentGridSize}, 18px)`;
    minimap.style.gridTemplateRows = `repeat(${currentGridSize}, 18px)`;
    const currentFloorData =
      visitedRooms[room.mapnum]?.[room.floor] ||
      Array.from({ length: currentGridSize }, () =>
        Array(currentGridSize).fill(false)
      );
    // y=0が下、yが大きいほど上になるよう逆順で描画
    for (let y = currentGridSize - 1; y >= 0; y--) {
      for (let x = 0; x < currentGridSize; x++) {
        const cell = document.createElement("div");
        cell.className = "minimap__cell";
        if (currentFloorData[y][x])
          cell.classList.add("minimap__cell--visited");
        if (room.x === x && room.y === y)
          cell.classList.add("minimap__cell--current");
        minimap.appendChild(cell);
      }
    }
  }
  const tileSize = setTileSize();
  // 部屋の背景画像切り替え
  const bgImg = mapEl.querySelector(".map__background");
  // どの方向に隣接部屋があるか判定
  const currentGridSize = getRoomGridSize();
  const up = room.y < currentGridSize - 1;
  const down = room.y > 0;
  const left = room.x > 0;
  const right = room.x < currentGridSize - 1;
  let key = "";
  if (up) key += "u";
  if (down) key += "d";
  if (right) key += "r";
  if (left) key += "l";
  if (key) {
    bgImg.src = `img/map/map_${key}.webp`;
  } else {
    bgImg.src = "img/map/map_0.png";
  }
  // 二度目の入室時の一時的な黒背景
  bgImg.style.filter = roomBlackout ? "brightness(0)" : "";

  // キャラクターの足元がマスの下端に揃うように配置
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

export function renderGame() {
  render();
  renderStoneboards();
  renderStands();
  renderMagicCircles();
  renderNormalMagicCircles();
  renderButtons();
  renderBoxes();
  renderStandItems();
  renderLadder();
  renderJewelries();
}

export { showItemModal } from "./utils.js";
