// ===== ゲームデータ・コンフィグ =====

// ハシゴ配置データ
// roomKey: ハシゴがある部屋, x/y: ハシゴの座標, dest: 移動先 {x, y, floor, mapnum, era}, unlocked: 解放状態
export const ladders = [
  {
    roomKey: "1,1,1,1,-1",
    x: 2,
    y: 3,
    dest: { x: 0, y: 0, floor: 2, mapnum: 1, era: -1 },
    unlocked: false,
    direction: "up",
  },
  {
    roomKey: "0,0,2,1,-1",
    x: 2,
    y: 3,
    dest: { x: 1, y: 1, floor: 1, mapnum: 1, era: -1 },
    unlocked: true,
    direction: "down",
  },
  {
    roomKey: "1,1,2,1,-1",
    x: 2,
    y: 3,
    dest: { x: 0, y: 0, floor: 3, mapnum: 1, era: -1 },
    unlocked: false,
    direction: "up",
  },

  {
    roomKey: "0,0,3,1,-1",
    x: 2,
    y: 3,
    dest: { x: 1, y: 1, floor: 2, mapnum: 1, era: -1 },
    direction: "down",
    unlocked: true,
  },
  {
    roomKey: "0,0,2,2,-1",
    x: 2,
    y: 3,
    dest: { x: 1, y: 2, floor: 1, mapnum: 2, era: -1 },
    unlocked: true,
    direction: "down",
  },
  {
    roomKey: "1,2,1,2,-1",
    x: 2,
    y: 3,
    dest: { x: 0, y: 0, floor: 2, mapnum: 2, era: -1 },
    unlocked: true,
    direction: "up",
  },
  {
    roomKey: "1,2,1,2,-1",
    x: 2,
    y: 1,
    dest: { x: 2, y: 3, floor: 0, mapnum: 2, era: -1 },
    unlocked: false,
    direction: "down",
  },
  {
    roomKey: "2,3,0,2,-1",
    x: 2,
    y: 1,
    dest: { x: 1, y: 2, floor: 1, mapnum: 2, era: -1 },
    unlocked: false,
    direction: "up",
  },
  {
    roomKey: "3,1,0,2,-1",
    x: 2,
    y: 3,
    dest: { x: 2, y: 0, floor: 1, mapnum: 2, era: -1 },
    unlocked: false,
    direction: "up",
  },
];

// 石板配置データ: { [roomKey]: [{ x, y, img }] }
// roomKey形式: "x,y,floor,mapnum,era"
export const stoneboards = {
  "1,0,1,1,-1": [{ x: 2, y: 0, img: "nazo_1-1-22.png", direction: "down" }],
  "3,0,1,1,-1": [{ x: 2, y: 0, img: "nazo_1-1-24.png", direction: "down" }],
  "1,4,1,1,-1": [{ x: 2, y: 4, img: "nazo_1-1-2.png", direction: "up" }],
  "3,4,1,1,-1": [{ x: 2, y: 4, img: "nazo_1-1-4.png", direction: "up" }],
  "0,1,1,1,-1": [{ x: 0, y: 2, img: "nazo_1-1-16.png", direction: "left" }],
  "0,3,1,1,-1": [{ x: 0, y: 2, img: "nazo_1-1-6.png", direction: "left" }],
  "4,1,1,1,-1": [{ x: 4, y: 2, img: "nazo_1-1-20.png", direction: "right" }],
  "4,3,1,1,-1": [{ x: 4, y: 2, img: "nazo_1-1-10.png", direction: "right" }],
  "1,1,1,1,-1": [{ x: 4, y: 4, img: "nazo_1-1-17.png", direction: "right" }],
  "1,1,2,1,-1": [{ x: 4, y: 4, img: "nazo_1-2-5.png", direction: "right" }],
  "0,0,3,1,-1": [{ x: 2, y: 4, img: "nazo_1-3-1A.png", direction: "up" }],

  "0,0,2,2,-1": [
    { x: 2, y: 4, img: "nazo_2-2-1A.png", direction: "up" },
    { x: 4, y: 2, img: "nazo_2-2-1B.png", direction: "right", frame: "window" },
  ],
  "2,2,1,2,-1": [{ x: 4, y: 2, img: "nazo_2-1-3.png", direction: "right" }],
  "1,0,1,2,-1": [
    { x: 2, y: 0, img: "nazo_2-1-8.png", direction: "down", frame: "window" },
  ],
  "3,1,0,2,-1": [{ x: 4, y: 4, img: "nazo_2-B1-19.png", direction: "right" }],
  "0,0,2,1,0": [
    { x: 1, y: 4, img: "modern/guard_guide.png", direction: "up" },
    { x: 1, y: 0, img: "modern/panel_guide.png", direction: "down" },
    { x: 0, y: 2, frameImg: "img/UI/white_tate.png", direction: "left", isBattery: true },
    { x: 3, y: 4, frameImg: "img/UI/shelf_small.png", direction: "up", isShelfSmall: true },
    { x: 2, y: 0, frameImg: "img/UI/red_door.png", direction: "down", unclickable: true, isDoor: true },
    { x: 3, y: 4, frameImg: "img/UI/line_corner.png", direction: "up", unclickable: true, isLineCorner: true }
  ]
};

// 特別な魔法陣（白）配置データ: { [roomKey]: [{ x, y, width, height }] }
export const magicCircles = {
  "1,3,1,1,-1": [{ x: 2, y: 2, width: 3, height: 3, state: "white" }],
  "3,3,1,1,-1": [{ x: 2, y: 2, width: 3, height: 3, state: "white" }],
};

// ボタン配置データ: { [roomKey]: [{ x, y }] }
export const buttons_data = {
  "1,3,1,1,-1": [{ x: 4, y: 0, color: "blue" }],
  "3,3,1,1,-1": [{ x: 4, y: 0, color: "red" }],
  // map1 → map2 ワープボタン（隣のピラミッドへ）
  "2,2,2,1,-1": [
    {
      x: 0,
      y: 0,
      img: "img/UI/button_2.png",
      action: "warp",
      // ワープ先: map2 2F 左下の部屋
      targetRoomKey: "0,0,2,2,-1",
    },
  ],
  // map2 → map1 ワープボタン（隣のピラミッドへ）
  "0,0,2,2,-1": [
    {
      x: 0,
      y: 0,
      img: "img/UI/button_1.png",
      action: "warp",
      // ワープ先: map1 2F 中央の部屋
      targetRoomKey: "2,2,2,1,-1",
    },
  ],
  // map2 0F: (2,3,0,2) にボタン追加（ハシゴ解放）
  "2,3,0,2,-1": [
    {
      x: 0,
      y: 0,
      img: "img/UI/button_up.png",
      action: "unlockLadders",
      targets: ["2,3,0,2,-1", "1,2,1,2,-1"],
    },
  ],
  "2,0,1,2,-1": [
    {
      x: 0,
      y: 0,
      img: "img/UI/button_3.png",
      action: "warp",
      targetRoomKey: "0,0,1,3,-1",
    },
  ],
  "0,0,1,3,-1": [
    {
      x: 0,
      y: 0,
      img: "img/UI/button_2.png",
      action: "warp",
      targetRoomKey: "2,0,1,2,-1",
    },
  ],
};

// 普通の魔法陣（mahoujin.png）配置データ
export const normalMagicCircles = {
  "0,0,1,1,-1": [{ width: 3, height: 3 }],
  "0,2,1,1,-1": [{ width: 3, height: 3 }],
  "0,4,1,1,-1": [{ width: 3, height: 3 }],
  "1,1,1,1,-1": [{ width: 3, height: 3 }],
  "2,0,1,1,-1": [{ width: 3, height: 3 }],
  "2,2,1,1,-1": [{ width: 3, height: 3 }],
  "2,4,1,1,-1": [{ width: 3, height: 3 }],
  "4,0,1,1,-1": [{ width: 3, height: 3 }],
  "4,2,1,1,-1": [{ width: 3, height: 3 }],
  "4,4,1,1,-1": [{ width: 3, height: 3 }],
  // 2F: 1,1 にオレンジの魔法陣を配置
  "1,1,2,1,-1": [{ width: 3, height: 3, img: "img/UI/mahoujin_orange.png" }],
  "3,1,0,2,-1": [{ width: 3, height: 3, img: "img/UI/mahoujin_star.png" }],
};

// 台座配置データ: { [roomKey]: [{ x, y }] }
export const stands = {
  "0,0,1,1,-1": [{ x: 0, y: 0 }],
  "2,0,1,1,-1": [{ x: 0, y: 0 }],
  "4,0,1,1,-1": [{ x: 0, y: 0 }],
  "1,1,1,1,-1": [{ x: 0, y: 0 }],
  "3,1,1,1,-1": [{ x: 0, y: 0 }],
  "0,2,1,1,-1": [{ x: 0, y: 0 }],
  "2,2,1,1,-1": [{ x: 0, y: 0 }],
  "4,2,1,1,-1": [{ x: 0, y: 0 }],
  "1,3,1,1,-1": [{ x: 2, y: 2 }],
  "3,3,1,1,-1": [{ x: 2, y: 2 }],
  "0,4,1,1,-1": [{ x: 0, y: 0 }],
  "2,4,1,1,-1": [{ x: 0, y: 0 }],
  "4,4,1,1,-1": [{ x: 0, y: 0 }],
  "0,0,1,2,-1": [{ x: 0, y: 0 }],
  "0,1,1,2,-1": [{ x: 0, y: 0 }],
  "0,2,1,2,-1": [{ x: 0, y: 0 }],
  "1,0,1,2,-1": [{ x: 0, y: 0 }],
  "1,1,1,2,-1": [{ x: 0, y: 0 }],
  "1,2,1,2,-1": [{ x: 0, y: 0 }],
  "2,1,1,2,-1": [{ x: 0, y: 0 }],
  "2,2,1,2,-1": [{ x: 0, y: 0 }],
};

// 宝箱配置データ: { [roomKey]: [{ x, y, img, answer }] }
export const boxes = {
  "2,4,1,1,-1": [{ x: 2, y: 4, img: "img/nazo/nazo_1-1-3.png", answer: "cbtf" }],
  "0,2,1,1,-1": [{ x: 0, y: 2, img: "img/nazo/nazo_1-1-11.png", answer: "cgsj" }],
  "4,2,1,1,-1": [{ x: 4, y: 2, img: "img/nazo/nazo_1-1-15.png", answer: "cjkf" }],
  "2,0,1,1,-1": [{ x: 2, y: 0, img: "img/nazo/nazo_1-1-23.png", answer: "cjlm" }],
  "1,2,2,1,-1": [{ x: 2, y: 4, img: "img/nazo/nazo_1-2-2A.png", answer: "dqv" }],
  "0,1,2,1,-1": [{ x: 0, y: 2, img: "img/nazo/nazo_1-2-4A.png", answer: "dqr" }],
  "2,1,2,1,-1": [{ x: 4, y: 2, img: "img/nazo/nazo_1-2-6A.png", answer: "dqt" }],
  "1,0,2,1,-1": [{ x: 2, y: 0, img: "img/nazo/nazo_1-2-8A.png", answer: "dqs" }],
  "0,0,3,1,-1": [{ x: 2, y: 0, img: "img/nazo/nazo_1-3-1B.png", answer: "cfcr" }],
  "0,0,2,1,0": [
    {
      x: 0,
      y: 0,
      sprite: "img/UI/shelf_big.png",
      name: "棚",
      answer: null,
    },
    {
      x: 0,
      y: 4,
      sprite: "img/UI/closet.png",
      name: "クローゼット",
      answer: null,
      rewardItem: {
        id: "panel_curve",
        name: "曲線ピース",
        img: "img/item/panel_curve.png",
        desc: "90度曲がった導線が埋め込まれたピース。鉄板の窪みに配置することができる",
        count: 2,
      },
    },
    {
      x: 4,
      y: 3,
      sprite: "img/UI/bed.png",
      name: "ベッド",
      answer: null,
      rewardItem: {
        id: "driver",
        name: "ドライバー",
        img: "img/item/driver.png",
        desc: "普通のプラスドライバーだ。ネジを取ることができる。",
        count: 1,
      },
    },
    {
      x: 1,
      y: 2,
      sprite: "img/UI/panel_3*3.png",
      name: "パネル配置1",
      answer: null,
    },
    {
      x: 2,
      y: 3,
      sprite: "img/UI/panel_3*3.png",
      name: "パネル配置2",
      answer: null,
    },
    {
      x: 3,
      y: 2,
      sprite: "img/UI/panel_3*3.png",
      name: "パネル配置3",
      answer: null,
    },
    {
      x: 4,
      y: 0,
      sprite: "img/UI/kinko.png",
      name: "金庫",
      answer: null,
    },
    {
      x: 4,
      y: 4,
      sprite: "img/UI/white_square.png",
      name: "階段ハシゴ",
      answer: null,
    },
  ],
};

// 2F宝箱の開封後に表示する紙画像
export const boxPaperRewards = {
  "1,2,2,1,-1": "img/nazo/nazo_1-2-2B.png",
  "0,1,2,1,-1": "img/nazo/nazo_1-2-4B.png",
  "2,1,2,1,-1": "img/nazo/nazo_1-2-6B.png",
  "1,0,2,1,-1": "img/nazo/nazo_1-2-8B.png",
};

// 宝石（クリアアイテム）配置データ: { [roomKey]: [{ x, y, img }] }
export const jewelries = {
  "0,0,1,3,-1": [{ x: 2, y: 3, img: "img/UI/jewelry.png" }],
};

// 進入不可マスデータ: { [roomKey]: [{ x, y, type }] }
export const blockedTiles = {};

// blockedTilesを初期化（boxes, stands, buttons_dataから自動生成）
Object.keys(boxes).forEach((roomKey) => {
  if (!blockedTiles[roomKey]) blockedTiles[roomKey] = [];
  boxes[roomKey].forEach(({ x, y }) => {
    // 時代0, マップ1, フロア2の部屋0,0のベッド(4,3), パネル配置マス, 白い四角(4,4)は進入可能にするため除外
    if (
      roomKey === "0,0,2,1,0" &&
      ((x === 4 && y === 3) ||
        (x === 1 && y === 2) ||
        (x === 2 && y === 3) ||
        (x === 3 && y === 2) ||
        (x === 4 && y === 4))
    ) {
      return;
    }
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
  {
    id: "panel_curve",
    name: "曲線ピース",
    img: "img/item/panel_curve.png",
    desc: "90度曲がった導線が埋め込まれたピース。鉄板の窪みに配置することができる",
    unlocked: false,
    count: 0,
  },
  {
    id: "panel_straight",
    name: "直線ピース",
    img: "img/item/panel_straight.png",
    desc: "まっすぐな導線が埋め込まれたピース。鉄板の窪みに配置することができる",
    unlocked: false,
    count: 0,
  },
  {
    id: "driver",
    name: "ドライバー",
    img: "img/item/driver.png",
    desc: "普通のプラスドライバーだ。ネジを取ることができる。",
    unlocked: false,
    count: 0,
  },
  {
    id: "red_button",
    name: "赤いスイッチ",
    img: "img/item/red_button.jpeg",
    desc: "棚の中から出てきた機械。棚の中に説明が書いてあるようだ。",
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

// 壁（移動不可な境界線）データ: { [roomKey]: [{ p1: {x, y}, p2: {x, y} }] }
export const walls = {
  "0,0,2,1,0": [
    { p1: { x: 3, y: 4 }, p2: { x: 4, y: 4 } },
    { p1: { x: 3, y: 4 }, p2: { x: 3, y: 3 } },
    { p1: { x: 3, y: 0 }, p2: { x: 2, y: 0 } },
    { p1: { x: 3, y: 0 }, p2: { x: 3, y: 1 } },
  ],
};

// 回転時も元の位置・向きを保持するオブジェクトの座標リスト（部屋 "0,0,2,1,0" 専用）
export function isNonRotatableTile(x, y) {
  const nonRotatableList = [
    { x: 1, y: 4 }, // stoneboard (1,4)
    { x: 3, y: 4 }, // small shelf & line_corner (3,4)
    { x: 0, y: 2 }, // white vertical wire (0,2)
    { x: 0, y: 1 }, // iron plate (0,1)
    { x: 1, y: 0 }, // stoneboard (1,0)
    { x: 2, y: 0 }, // door (2,0)
  ];
  return nonRotatableList.some(tile => tile.x === x && tile.y === y);
}

