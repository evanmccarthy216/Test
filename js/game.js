const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const TILE = 20;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;

let snake, dir, food, running, score, loopId;

function reset() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x:1, y:0};
  placeFood();
  score = 0;
  running = true;
  scoreEl.textContent = score;
  if (loopId) cancelAnimationFrame(loopId);
  lastTick = performance.now();
  tick();
}

function placeFood() {
  while (true) {
    const f = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
    if (!snake.some(s => s.x===f.x && s.y===f.y)) { food = f; break; }
  }
}

function drawTile(x,y,color){
  ctx.fillStyle = color;
  ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
}

function step(){
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if (head.x <0 || head.x>=COLS || head.y<0 || head.y>=ROWS || snake.some(s=>s.x===head.x&&s.y===head.y)) {
    running = false; return;
  }
  snake.unshift(head);
  if (head.x===food.x && head.y===food.y) { score++; scoreEl.textContent = score; placeFood(); }
  else snake.pop();
}

let lastTick = 0;
const TICK_RATE = 8; // updates per second

function tick(now){
  loopId = requestAnimationFrame(tick);
  if (!running) return draw();
  const delta = now - lastTick;
  if (delta < 1000 / TICK_RATE) return;
  lastTick = now;
  step();
  draw();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw food
  drawTile(food.x, food.y, '#f55');
  // draw snake
  snake.forEach((s,i)=> drawTile(s.x,s.y, i===0? '#8f0' : '#0f6'));
  if (!running) {
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0, canvas.height/2-30, canvas.width, 60);
    ctx.fillStyle='#fff'; ctx.font='20px sans-serif'; ctx.textAlign='center'; ctx.fillText('Game Over — Press Restart', canvas.width/2, canvas.height/2+7);
  }
}

window.addEventListener('keydown', e=>{
  if (e.code==='Space') { running = !running; if (running) { lastTick = performance.now(); tick(); } return; }
  const map = {
    ArrowUp: {x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}
  };
  const nd = map[e.key] || map[e.code];
  if (nd) {
    // prevent reversing
    if (snake.length>1 && nd.x === -dir.x && nd.y === -dir.y) return;
    dir = nd;
    e.preventDefault();
  }
});

restartBtn.addEventListener('click', reset);

reset();
