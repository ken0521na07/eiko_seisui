// ===== ゲームデータ・コンフィグ =====

// ハシゴ配置データ
// roomKey: ハシゴがある部屋, x/y: ハシゴの座標, dest: 移動先 {x, y, floor, mapnum}, unlocked: 解放状態
export const ladders = [
  {
    roomKey: "1,1,1,1",
    x: 2,
    y: 2,
    dest: { x: 0, y: 0, floor: 2, mapnum: 1 },
    unlocked: false,
    prompt: "ハシゴを上りますか？",
  },
  {
    roomKey: "0,0,2,1",
    x: 2,
    y: 2,
    dest: { x: 1, y: 1, floor: 1, mapnum: 1 },
    unlocked: true,
    prompt: "ハシゴを降りますか？",
  },
  {
    roomKey: "1,1,2,1",
    x: 2,
    y: 2,
    dest: { x: 0, y: 0, floor: 3, mapnum: 1 },
    unlocked: false,
    prompt: "ハシゴを上りますか？",
  },
  {
    roomKey: "0,0,3,1",
    x: 2,
    y: 2,
    dest: { x: 1, y: 1, floor: 2, mapnum: 1 },
    unlocked: true, // 3F→2Fは常に解放
    prompt: "ハシゴを降りますか？",
  },
];

// 石板配置データ: { [roomKey]: [{ x, y, img }] }
// roomKey形式: "x,y,floor,mapnum"
export const stoneboards = {
  "1,0,1,1": [{ x: 2, y: 0, img: "nazo_1-1-22.png", direction: "down" }],
  "3,0,1,1": [{ x: 2, y: 0, img: "nazo_1-1-24.png", direction: "down" }],
  "1,4,1,1": [{ x: 2, y: 4, img: "nazo_1-1-2.png", direction: "up" }],
  "3,4,1,1": [{ x: 2, y: 4, img: "nazo_1-1-4.png", direction: "up" }],
  "0,1,1,1": [{ x: 0, y: 2, img: "nazo_1-1-16.png", direction: "left" }],
  "0,3,1,1": [{ x: 0, y: 2, img: "nazo_1-1-6.png", direction: "left" }],
  "4,1,1,1": [{ x: 4, y: 2, img: "nazo_1-1-20.png", direction: "right" }],
  "4,3,1,1": [{ x: 4, y: 2, img: "nazo_1-1-10.png", direction: "right" }],
  "1,1,1,1": [{ x: 4, y: 4, img: "nazo_1-1-17.png", direction: "right" }],
  "1,1,2,1": [{ x: 4, y: 4, img: "nazo_1-2-5.png", direction: "right" }],
  "0,0,3,1": [{ x: 2, y: 4, img: "nazo_1-3-1A.png", direction: "up" }],
};

// 特別な魔法陣（白）配置データ: { [roomKey]: [{ x, y, width, height }] }
export const magicCircles = {
  "1,3,1,1": [{ x: 2, y: 2, width: 3, height: 3, state: "white" }],
  "3,3,1,1": [{ x: 2, y: 2, width: 3, height: 3, state: "white" }],
};

// ボタン配置データ: { [roomKey]: [{ x, y }] }
export const buttons_data = {
  "1,3,1,1": [{ x: 4, y: 0, color: "blue" }],
  "3,3,1,1": [{ x: 4, y: 0, color: "red" }],
  "2,2,2,1": [{ x: 2, y: 2, img: "img/UI/button_2.png", action: "warp" }],
};

// 普通の魔法陣（mahoujin.png）配置データ
export const normalMagicCircles = {
  "0,0,1,1": [{ width: 3, height: 3 }],
  "0,2,1,1": [{ width: 3, height: 3 }],
  "0,4,1,1": [{ width: 3, height: 3 }],
  "1,1,1,1": [{ width: 3, height: 3 }],
  "2,0,1,1": [{ width: 3, height: 3 }],
  "2,2,1,1": [{ width: 3, height: 3 }],
  "2,4,1,1": [{ width: 3, height: 3 }],
  "4,0,1,1": [{ width: 3, height: 3 }],
  "4,2,1,1": [{ width: 3, height: 3 }],
  "4,4,1,1": [{ width: 3, height: 3 }],
  // 2F: 1,1 にオレンジの魔法陣を配置
  "1,1,2,1": [{ width: 3, height: 3, img: "img/UI/mahoujin_orange.png" }],
};

// 台座配置データ: { [roomKey]: [{ x, y }] }
export const stands = {
  "0,0,1,1": [{ x: 0, y: 0 }],
  "2,0,1,1": [{ x: 0, y: 0 }],
  "4,0,1,1": [{ x: 0, y: 0 }],
  "1,1,1,1": [{ x: 0, y: 0 }],
  "3,1,1,1": [{ x: 0, y: 0 }],
  "0,2,1,1": [{ x: 0, y: 0 }],
  "2,2,1,1": [{ x: 0, y: 0 }],
  "4,2,1,1": [{ x: 0, y: 0 }],
  "1,3,1,1": [{ x: 2, y: 2 }],
  "3,3,1,1": [{ x: 2, y: 2 }],
  "0,4,1,1": [{ x: 0, y: 0 }],
  "2,4,1,1": [{ x: 0, y: 0 }],
  "4,4,1,1": [{ x: 0, y: 0 }],
};

// 宝箱配置データ: { [roomKey]: [{ x, y, img, answer }] }
export const boxes = {
  "2,4,1,1": [{ x: 2, y: 4, img: "img/nazo/nazo_1-1-3.png", answer: "cbtf" }],
  "0,2,1,1": [{ x: 0, y: 2, img: "img/nazo/nazo_1-1-11.png", answer: "cgsj" }],
  "4,2,1,1": [{ x: 4, y: 2, img: "img/nazo/nazo_1-1-15.png", answer: "cjkf" }],
  "2,0,1,1": [{ x: 2, y: 0, img: "img/nazo/nazo_1-1-23.png", answer: "cjlm" }],
  "1,2,2,1": [{ x: 2, y: 4, img: "img/nazo/nazo_1-2-2A.png", answer: "dqv" }],
  "0,1,2,1": [{ x: 0, y: 2, img: "img/nazo/nazo_1-2-4A.png", answer: "dqr" }],
  "2,1,2,1": [{ x: 4, y: 2, img: "img/nazo/nazo_1-2-6A.png", answer: "dqt" }],
  "1,0,2,1": [{ x: 2, y: 0, img: "img/nazo/nazo_1-2-8A.png", answer: "dqs" }],
  "0,0,3,1": [{ x: 2, y: 0, img: "img/nazo/nazo_1-3-1B.png", answer: "cfcr" }],
};

// 2F宝箱の開封後に表示する紙画像
export const boxPaperRewards = {
  "1,2,2,1": "img/nazo/nazo_1-2-2B.png",
  "0,1,2,1": "img/nazo/nazo_1-2-4B.png",
  "2,1,2,1": "img/nazo/nazo_1-2-6B.png",
  "1,0,2,1": "img/nazo/nazo_1-2-8B.png",
};

// 進入不可マスデータ: { [roomKey]: [{ x, y, type }] }
// 宝箱・台座・ボタンから自動生成される（を参照）
export const blockedTiles = {};

// blockedTilesを初期化（boxes, stands, buttons_dataから自動生成）
Object.keys(boxes).forEach((roomKey) => {
  if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
  boxes[roomKey].forEach(({ x, y }) => {
    if (!blockedTiles[roomKey].some((tile) => tile.x === x && tile.y === y)) {
      blockedTiles[roomKey].push({ x, y, type: "box" });
    }
  });
});

Object.keys(stands).forEach((roomKey) => {
  if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
  stands[roomKey].forEach(({ x, y }) => {
    if (!blockedTiles[roomKey].some((tile) => tile.x === x && tile.y === y)) {
      blockedTiles[roomKey].push({ x, y, type: "stand" });
    }
  });
});

Object.keys(buttons_data).forEach((roomKey) => {
  if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
  buttons_data[roomKey].forEach(({ x, y }) => {
    if (!blockedTiles[roomKey].some((tile) => tile.x === x && tile.y === y)) {
      blockedTiles[roomKey].push({ x, y, type: "button" });
    }
  });
});

// アイテムデータ
export const itemList = [
  {
    id: "coin",
    name: "コイン",
    img: "img/item/coin.png",
    desc: "金色のコイン。そこまで価値は高くなさそうだ。",
    unlocked: false,
  },
  {
    id: "tsubo",
    name: "水瓶",
    img: "img/item/tsubo.png",
    desc: "水を入れるための容器。今は空っぽ。",
    unlocked: false,
  },
  {
    id: "teppan",
    name: "錆びた鉄板",
    img: "img/item/teppan.png",
    desc: "さび付いた鉄板。やすりがあれば磨けそうだ。",
    unlocked: false,
  },
  {
    id: "yasuri",
    name: "やすり",
    img: "img/item/yasuri.png",
    desc: "錆びた金属を磨く道具。",
    unlocked: false,
  },
  {
    id: "chokinbako",
    name: "貯金箱",
    img: "img/item/chokinbako.png",
    desc: "木でできた貯金箱。中にコインが入っていそうだ。",
    unlocked: false,
  },
  {
    id: "mirror",
    name: "鏡",
    img: "img/item/mirror.png",
    desc: "ピカピカの鏡。",
    unlocked: false,
  },
  {
    id: "redkey",
    name: "赤い鍵",
    img: "img/item/redkey.png",
    desc: "赤色の鍵だ。赤い扉を開けられそうだ。",
    unlocked: false,
  },
];

// アイテム定義上の初期解放状態を保持
export const defaultUnlockedById = itemList.reduce((acc, item) => {
  acc[item.id] = item.unlocked;
  return acc;
}, {});

// アイテム組み合わせルール: { item1: item2 -> result }
export const itemCombinations = [
  {
    items: ["teppan", "yasuri"],
    result: {
      id: "mirror",
      name: "鏡",
      message: "鏡ができた！",
    },
  },
];
