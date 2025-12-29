// ===== 移動制御 =====

import { gridSize, directions, clamp } from "./constants.js";
import {
  position,
  room,
  getRoomKey,
  getRoomGridSize,
  visitedRooms,
  roomBlackout,
  setRoomBlackout,
  controlsDisabled,
  setControlsDisabled,
  magicCircleStates,
} from "./state.js";
import { itemList } from "./config.js";
import {
  getFloor2CenterUnlocked,
  setFloor2CenterUnlocked,
  saveGameState,
} from "./storage.js";
import { showBottomModal, renderGame, renderLadder, render } from "./ui.js";
import { ladders } from "./config.js";
import { blockedTiles } from "./config.js";

export function move(dir) {
  if (controlsDisabled) return;
  const delta = directions[dir];
  if (!delta) return;
  const [dx, dy] = delta;
  let nextX = position.x + dx;
  let nextY = position.y + dy;

  // 部屋の端の中央マスから外に出る場合、隣接部屋へ移動
  let movedRoom = false;
  // 部屋移動時はアニメーションを一時的に無効化
  function disableCharacterTransition() {
    const characterEl = document.getElementById("character");
    characterEl.style.transition = "none";
    // 強制再描画
    void characterEl.offsetWidth;
  }
  function enableCharacterTransition() {
    const characterEl = document.getElementById("character");
    characterEl.style.transition = "";
  }
  // Y軸: 上端はy=gridSize-1, 下端はy=0
  const roomCount = getRoomGridSize();
  const maxTileCoord = gridSize - 1;
  if (
    nextY > maxTileCoord &&
    position.x === 2 &&
    dy === 1 &&
    room.y < roomCount - 1
  ) {
    // 2F中央(2,2,2,1)への進入規制: 下(2,1)から上へ
    if (room.floor === 2 && room.mapnum === 1 && room.x === 2 && room.y === 1) {
      const hasRedKey = itemList.some(
        (item) => item.id === "redkey" && item.unlocked
      );
      if (!hasRedKey) {
        showBottomModal({
          text: "通路に赤い扉がある。扉には鍵がかかっている、鍵があれば開きそうだ。",
        });
        return;
      }
      // redkeyを持っており、未会の場合のみモーダルを表示
      const alreadyUnlocked = getFloor2CenterUnlocked();
      if (!alreadyUnlocked) {
        showBottomModal({
          text: "赤い鍵を用いて扉を開けた。",
          close: () => {
            // 初回のが終了したら、中央層に誘導する
            setFloor2CenterUnlocked();
          },
        });
        // 移動を不可能にして、上記に処理を漏れば友人墨ぜない
        return;
      }
    }
    disableCharacterTransition();
    // 上端中央
    room.y += 1;
    nextY = 0;
    nextX = 2;
    movedRoom = true;
    handleRoomEntryOrFall();
  } else if (nextY < 0 && position.x === 2 && dy === -1 && room.y > 0) {
    // map2 1F (2,0,1,2)への進入規制: 上(2,1)から下へ
    if (room.floor === 1 && room.mapnum === 2 && room.x === 2 && room.y === 1) {
      showBottomModal({
        text: "通路に固い扉がある。\n条件を満たさないと開かなさそうだ。",
      });
      return;
    }
    disableCharacterTransition();
    // 下端中央
    room.y -= 1;
    nextY = maxTileCoord;
    nextX = 2;
    movedRoom = true;
    handleRoomEntryOrFall();
  } else if (
    nextX > maxTileCoord &&
    position.y === 2 &&
    dx === 1 &&
    room.x < roomCount - 1
  ) {
    // 2F中央(2,2,2,1)への進入規制: 左(1,2)から右へ
    if (room.floor === 2 && room.mapnum === 1 && room.x === 1 && room.y === 2) {
      const hasRedKey = itemList.some(
        (item) => item.id === "redkey" && item.unlocked
      );
      if (!hasRedKey) {
        showBottomModal({
          text: "通路に赤い扉がある。扉には鍵がかかっている、鍵があれば開きそうだ。",
        });
        return;
      }
      // redkeyを持っており、未会の場合のみモーダルを表示
      const alreadyUnlocked = getFloor2CenterUnlocked();
      if (!alreadyUnlocked) {
        showBottomModal({
          text: "赤い鍵を用いて扉を開けた。",
          close: () => {
            // 初回のが終了したら、中央層に誘導する
            setFloor2CenterUnlocked();
          },
        });
        // 移動を不可能にして、上記に処理を漏れば友人墨ぜない
        return;
      }
    }
    // map2 1F (2,0,1,2)への進入規制: 左(1,0)から右へ
    if (room.floor === 1 && room.mapnum === 2 && room.x === 1 && room.y === 0) {
      showBottomModal({
        text: "通路に固い扉がある。\n条件を満たさないと開かなさそうだ。",
      });
      return;
    }
    disableCharacterTransition();
    // 右端中央
    room.x += 1;
    nextX = 0;
    nextY = 2;
    movedRoom = true;
    handleRoomEntryOrFall();
  } else if (nextX < 0 && position.y === 2 && dx === -1 && room.x > 0) {
    disableCharacterTransition();
    // 左端中央
    room.x -= 1;
    nextX = maxTileCoord;
    nextY = 2;
    movedRoom = true;
    handleRoomEntryOrFall();
  } else if (nextY < 0 && position.x === 2 && dy === 1 && room.y > 0) {
    // 下端中央から下へは移動不可
    return;
  } else if (
    nextY > maxTileCoord &&
    position.x === 2 &&
    dy === -1 &&
    room.y < roomCount - 1
  ) {
    // 上端中央から上へは移動不可
    return;
  }

  // 通常の範囲内移動
  if (!movedRoom) {
    nextX = clamp(nextX, 0, gridSize - 1);
    nextY = clamp(nextY, 0, gridSize - 1);
    // 進入不可マスなら移動しない
    const roomKey = getRoomKey();
    if (isBlockedTile(roomKey, nextX, nextY)) return;
    if (nextX === position.x && nextY === position.y) return;
  }
  position.x = nextX;
  position.y = nextY;

  // ハシゴマスに入った時の処理
  const roomKey = getRoomKey();
  const activeLadder = ladders.find(
    (ladder) =>
      ladder.roomKey === roomKey &&
      ladder.unlocked &&
      ladder.x === position.x &&
      ladder.y === position.y
  );

  if (activeLadder) {
    showBottomModal({
      text:
        activeLadder.direction === "down"
          ? "ハシゴを降りますか？"
          : "ハシゴを上りますか？",
      yes: () => {
        // ハシゴでフロア移動する場合、map2の1Fの訪問フラグをすべてクリア
        if (activeLadder.dest.mapnum === 2) {
          if (visitedRooms[2] && visitedRooms[2][1]) {
            const gridSize1F = getRoomGridSize(1, 2);
            visitedRooms[2][1] = Array.from({ length: gridSize1F }, () =>
              Array(gridSize1F).fill(false)
            );
          }
        }
        // 目的地に移動
        room.floor = activeLadder.dest.floor;
        room.x = activeLadder.dest.x;
        room.y = activeLadder.dest.y;
        position.x = 2;
        position.y = 2;
        // 入室処理（訪問済みチェック・落下処理含む）
        handleRoomEntryOrFall();
      },
      no: () => {},
    });
  }

  render();
  saveGameState(position, room, visitedRooms, magicCircleStates);
  // 部屋移動後はアニメーションを戻す
  if (movedRoom) {
    setTimeout(enableCharacterTransition, 0);
  }
}

function handleRoomEntryOrFall() {
  const gridSizeCurrent = getRoomGridSize(room.floor);
  if (!visitedRooms[room.mapnum]) visitedRooms[room.mapnum] = {};
  if (!visitedRooms[room.mapnum][room.floor]) {
    visitedRooms[room.mapnum][room.floor] = Array.from(
      { length: gridSizeCurrent },
      () => Array(gridSizeCurrent).fill(false)
    );
  }
  const alreadyVisited = visitedRooms[room.mapnum][room.floor][room.y][room.x];

  // mapnum:2 の 1F で二度目の入室なら落下
  if (room.mapnum === 2 && room.floor === 1 && alreadyVisited) {
    // 一時的に黒背景を表示し、操作無効化
    setControlsDisabled(true);
    setRoomBlackout(true);
    renderGame();

    // 2秒後に落下処理
    setTimeout(() => {
      // 真下に落下: x+1, y+1, floor-1
      const targetFloor = room.floor - 1;
      const gridSizeBelow = getRoomGridSize(targetFloor);
      room.floor = targetFloor;
      room.x = Math.min(room.x + 1, gridSizeBelow - 1);
      room.y = Math.min(room.y + 1, gridSizeBelow - 1);
      position.x = 2;
      position.y = 2;

      // 目的地の訪問管理
      if (!visitedRooms[room.mapnum][room.floor]) {
        visitedRooms[room.mapnum][room.floor] = Array.from(
          { length: gridSizeBelow },
          () => Array(gridSizeBelow).fill(false)
        );
      }
      visitedRooms[room.mapnum][room.floor][room.y][room.x] = true;

      // 黒背景解除・操作復帰・再描画・メッセージ表示
      setRoomBlackout(false);
      setControlsDisabled(false);
      renderGame();
      saveGameState(position, room, visitedRooms, magicCircleStates);
      showBottomModal({ text: "一つ下に落下してしまった！" });
    }, 500);
  } else {
    // 初回入室の場合は訪問フラグを立てて通常描画
    visitedRooms[room.mapnum][room.floor][room.y][room.x] = true;
    renderGame();
    saveGameState(position, room, visitedRooms, magicCircleStates);
  }
}

export function isBlockedTile(roomKey, x, y) {
  const list = blockedTiles[roomKey] || [];
  return list.some((tile) => tile.x === x && tile.y === y);
}
