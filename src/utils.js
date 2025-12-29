// ===== ユーティリティ関数 =====

import { gridSize, MAP_PX, SAFE_MARGIN, PLAYABLE_PX } from "./constants.js";
import { mapEl, position, getRoomKey, standItems } from "./state.js";
import { itemList, itemCombinations, stands, ladders } from "./config.js";
import {
  saveUnlockedItems,
  saveStandItems,
  addUnlockedLaddersRoomKey,
} from "./storage.js";
import {
  showBottomModal,
  showModal,
  renderLadder,
  renderStandItems,
} from "./ui.js";

// アイテム解放関数
export function unlockItem(id) {
  const item = itemList.find((i) => i.id === id);
  if (item && !item.unlocked) {
    item.unlocked = true;
    saveUnlockedItems();
  }
}

// アイテム削除関数
export function removeItem(id) {
  const item = itemList.find((i) => i.id === id);
  if (item && item.unlocked) {
    item.unlocked = false;
    saveUnlockedItems();
  }
}

// 台座に置かれているアイテムIDのリストを取得
export function getPlacedItemIds() {
  const placedIds = [];
  Object.values(standItems).forEach((roomItems) => {
    Object.values(roomItems).forEach((item) => {
      if (!placedIds.includes(item.id)) {
        placedIds.push(item.id);
      }
    });
  });
  return placedIds;
}

// 台座上のアイテムをレンダリング
export function showStandItemImage(roomKey, standX, standY, item) {
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

// ハシゴ解放関数
export function unlockLadder(roomKey) {
  // 同じ部屋キーに複数のハシゴが存在する場合、すべて解放する
  const targets = ladders.filter((l) => l.roomKey === roomKey);
  targets.forEach((l) => {
    l.unlocked = true;
  });
  // 永続化（部屋キー単位で保持）
  addUnlockedLaddersRoomKey(roomKey);
}

// 指定されたアイテムIDが組み合わせられるかを確認
export function canCombine(itemId) {
  return itemCombinations.some((combo) => combo.items.includes(itemId));
}

// 指定されたアイテムIDの組み合わせ相手を取得
export function getItemToCombineWith(itemId) {
  const combo = itemCombinations.find((c) => c.items.includes(itemId));
  if (!combo) return null;
  const otherItem = combo.items.find((id) => id !== itemId);
  return otherItem;
}

// 指定されたアイテムの組み合わせ結果を取得
export function getCombinationResult(itemId1, itemId2) {
  const combo = itemCombinations.find(
    (c) =>
      (c.items[0] === itemId1 && c.items[1] === itemId2) ||
      (c.items[0] === itemId2 && c.items[1] === itemId1)
  );
  return combo ? combo.result : null;
}

// アイテム合成処理
export function performCombination(result, itemId1, itemId2) {
  // 合成に使用したアイテムを削除
  removeItem(itemId1);
  removeItem(itemId2);

  // 合成後のアイテムを解放
  unlockItem(result.id);

  // 合成完了メッセージを表示
  showCombinationMessage(result.message, result.id);
}

// 合成完了メッセージ表示
export function showCombinationMessage(message, resultItemId) {
  showBottomModal({
    text: message,
    close: () => {},
  });
}

// アイテム画面モーダル表示関数
export function showItemModal() {
  // 既存モーダルがあれば削除
  let old = document.getElementById("item-modal");
  if (old) old.remove();

  // モーダル本体
  const modal = document.createElement("div");
  modal.id = "item-modal";
  modal.className = "inventory-modal";

  // パネル
  const panel = document.createElement("div");
  panel.className = "inventory-panel";

  // 右: アイテム説明
  const descWrap = document.createElement("div");
  descWrap.className = "inventory-desc";

  // アイテム名
  const descTitle = document.createElement("div");
  descTitle.className = "inventory-desc__title";
  descWrap.appendChild(descTitle);
  // アイテム画像
  const descImg = document.createElement("img");
  descImg.className = "inventory-desc__img";
  descWrap.appendChild(descImg);
  // アイテム説明
  const descText = document.createElement("div");
  descText.className = "inventory-desc__text";
  descWrap.appendChild(descText);
  // 組み合わせボタン（必要時のみ表示）
  const combineBtn = document.createElement("button");
  combineBtn.className = "inventory-combine-btn";
  combineBtn.textContent = "組み合わせる";
  combineBtn.classList.add("yes");
  combineBtn.style.marginTop = "12px";
  combineBtn.style.width = "100%";
  combineBtn.style.display = "none";
  descWrap.appendChild(combineBtn);

  // 左: アイテムグリッド
  const grid = document.createElement("div");
  grid.className = "inventory-grid";

  // アイテム画像を並べる
  let selectedIdx = 0;
  let selectedItemId = null;
  let combinationMode = false;
  let combinationBaseId = null;
  // unlockedかつ台座に置かれていないアイテムのみ表示
  const placedIds = getPlacedItemIds();
  const unlockedItems = itemList.filter(
    (item) => item.unlocked && !placedIds.includes(item.id)
  );

  // セルを作成するヘルパー関数
  const createItemCell = (item, idx) => {
    const cell = document.createElement("div");
    cell.className = "inventory-cell";
    cell.dataset.itemId = item.id;
    cell.dataset.itemIdx = idx;

    // アイテム画像
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.className = "inventory-cell__img";
    cell.appendChild(img);

    const clearHighlights = () => {
      Array.from(grid.children).forEach((c) => {
        c.style.border = "2px solid #888";
        c.classList.remove("combine-blink");
      });
    };

    const updateDesc = (targetItem) => {
      descTitle.textContent = targetItem.name;
      descImg.src = targetItem.img;
      descImg.alt = targetItem.name;
      descText.textContent = targetItem.desc;

      const partnerId = getItemToCombineWith(targetItem.id);
      const hasPartner =
        partnerId && unlockedItems.some((i) => i.id === partnerId);
      if (hasPartner) {
        combineBtn.style.display = "block";
        combineBtn.onclick = () => {
          combinationMode = true;
          combinationBaseId = targetItem.id;
          clearHighlights();
          const partnerIdx = unlockedItems.findIndex((i) => i.id === partnerId);
          if (partnerIdx !== -1 && grid.children[partnerIdx]) {
            grid.children[partnerIdx].classList.add("combine-blink");
          }
          showBottomModal({
            text: `${targetItem.name}と組み合わせるアイテムを選んでください`,
            close: () => {},
          });
        };
      } else {
        combineBtn.style.display = "none";
        combinationMode = false;
        combinationBaseId = null;
      }
    };

    cell.addEventListener("click", () => {
      clearHighlights();
      cell.style.border = "3px solid #FFD600";

      if (combinationMode) {
        if (!combinationBaseId || combinationBaseId === item.id) return;
        const baseId = combinationBaseId;
        const result = getCombinationResult(baseId, item.id);
        combinationMode = false;
        combinationBaseId = null;
        clearHighlights();
        if (result) {
          const baseItem = itemList.find((i) => i.id === baseId);
          const baseName = baseItem?.name || baseId || "";
          const partnerName = item.name;
          const resultItem = itemList.find((i) => i.id === result.id);
          const resultName = resultItem?.name || result.name || result.id;
          const resultImg = resultItem?.img || "";
          removeItem(baseId);
          removeItem(item.id);
          unlockItem(result.id);
          const combinationText = `${baseName}と${partnerName}を組み合わせて${resultName}を入手した！`;
          showModal(resultImg, combinationText);
          modal.remove();
          return;
        }
        return;
      }

      selectedItemId = item.id;
      selectedIdx = idx;
      updateDesc(item);
    });

    return cell;
  };

  unlockedItems.forEach((item, idx) => {
    grid.appendChild(createItemCell(item, idx));
  });

  // 最初の説明はunlockedな最初のアイテム、なければ空欄
  if (unlockedItems.length > 0) {
    const first = unlockedItems[0];
    descTitle.textContent = first.name;
    descImg.src = first.img;
    descImg.alt = first.name;
    descText.textContent = first.desc;
    // 初期選択時に組み合わせボタンも更新
    const partnerId = getItemToCombineWith(first.id);
    const hasPartner =
      partnerId && unlockedItems.some((i) => i.id === partnerId);
    if (hasPartner) {
      combineBtn.style.display = "block";
      combineBtn.onclick = () => {
        combinationMode = true;
        combinationBaseId = first.id;
        Array.from(grid.children).forEach((c) => {
          c.style.border = "2px solid #888";
          c.classList.remove("combine-blink");
        });
        const partnerIdx = unlockedItems.findIndex((i) => i.id === partnerId);
        if (partnerIdx !== -1 && grid.children[partnerIdx]) {
          grid.children[partnerIdx].classList.add("combine-blink");
        }
        showBottomModal({
          text: `${first.name}と組み合わせるアイテムを選んでください`,
          close: () => {},
        });
      };
    } else {
      combineBtn.style.display = "none";
    }
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
  closeBtn.className = "inventory-close";
  closeBtn.addEventListener("click", () => modal.remove());
  panel.appendChild(closeBtn);

  modal.appendChild(panel);
  document.body.appendChild(modal);
}
