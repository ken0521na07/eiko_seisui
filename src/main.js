const gridSize = 5;
const position = { x: 2, y: 2 };

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
  const tileSize = mapEl.clientHeight / gridSize;
  mapEl.style.setProperty("--tile-size", `${tileSize}px`);
  characterEl.style.width = `${tileSize}px`;
  characterEl.style.height = `${tileSize}px`;
  return tileSize;
}

function render() {
  const tileSize = setTileSize();
  const x = position.x * tileSize;
  const y = position.y * tileSize;
  characterEl.style.transform = `translate(${x}px, ${y}px)`;
}

function move(dir) {
  const delta = directions[dir];
  if (!delta) return;
  const [dx, dy] = delta;
  const nextX = clamp(position.x + dx, 0, gridSize - 1);
  const nextY = clamp(position.y + dy, 0, gridSize - 1);
  if (nextX === position.x && nextY === position.y) return;
  position.x = nextX;
  position.y = nextY;
  render();
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
