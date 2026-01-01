// Unhappy Numbers — visualización estilo 3Blue1Brown (aproximación con Canvas)
// Sin dependencias: abre index.html o sirve el directorio con un server estático.

const $ = (sel) => /** @type {HTMLElement} */ (document.querySelector(sel));

const canvas = /** @type {HTMLCanvasElement} */ ($("#canvas"));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));

const nInput = /** @type {HTMLInputElement} */ ($("#nInput"));
const layoutSelect = /** @type {HTMLSelectElement} */ ($("#layoutSelect"));
const speedInput = /** @type {HTMLInputElement} */ ($("#speedInput"));
const startBtn = /** @type {HTMLButtonElement} */ ($("#startBtn"));
const pauseBtn = /** @type {HTMLButtonElement} */ ($("#pauseBtn"));
const stepBtn = /** @type {HTMLButtonElement} */ ($("#stepBtn"));
const randomBtn = /** @type {HTMLButtonElement} */ ($("#randomBtn"));

const statusEl = $("#status");
const ruleEl = $("#rule");
const pathEl = $("#path");
const cycleEl = $("#cycle");

const COLORS = {
  fg: "rgba(232,236,255,0.92)",
  muted: "rgba(232,236,255,0.55)",
  stroke: "rgba(232,236,255,0.18)",
  cyan: "#67e8f9",
  mint: "#86efac",
  amber: "#fbbf24",
  pink: "#f472b6",
  violet: "#a78bfa",
  danger: "rgba(244,114,182,0.95)",
};

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function digitsOf(n) {
  return String(Math.abs(n)).split("").map((d) => Number(d));
}

function sumSquareDigits(n) {
  const ds = digitsOf(n);
  let s = 0;
  for (const d of ds) s += d * d;
  return { next: s, digits: ds };
}

function isHappy(n) {
  const seen = new Set();
  let x = n;
  while (!seen.has(x)) {
    if (x === 1) return true;
    seen.add(x);
    x = sumSquareDigits(x).next;
  }
  return false;
}

function pickRandomUnhappy() {
  // Evita 1..10 típicos: buscamos algo "interesante" pero rápido de animar.
  for (let i = 0; i < 4000; i++) {
    const n = 2 + Math.floor(Math.random() * 1000);
    if (!isHappy(n)) return n;
  }
  return 20;
}

/** @typedef {{ x:number, y:number }} Vec */
/** @typedef {{ value:number, pos:Vec, vel:Vec, target:Vec, radius:number, hue:number, isCycle:boolean }} Node */
/** @typedef {{ from:number, to:number, t:number, done:boolean }} EdgeAnim */

/** @type {Node[]} */
let nodes = [];
/** @type {Map<number, number>} value -> node index */
let nodeIndexByValue = new Map();
/** @type {number[]} */
let sequence = [];
/** @type {number[]} */
let cycle = [];
/** @type {number} */
let cycleStartIndex = -1; // índice dentro de `sequence` donde empieza el ciclo (sin el nodo repetido final)
/** @type {Set<string>} */
let cycleEdgeSet = new Set(); // "a->b" para aristas del ciclo (incluye last->first)
/** @type {EdgeAnim|null} */
let edgeAnim = null;

let currentValue = 20;
let running = false;
let lastTs = 0;
let dpr = 1;

/** @type {"no_cross"|"orbital"} */
let layoutMode = "no_cross";
/** @type {{x:number,y:number}} */
let layoutCenter = { x: 0, y: 0 };

function setStatus(text) {
  statusEl.textContent = text;
}

function setRuleText(n, next, digits) {
  const pieces = digits.map((d) => `${d}²`).join(" + ");
  ruleEl.textContent = `${n} → ${pieces} = ${next}`;
}

function updateSidePanel() {
  pathEl.textContent = sequence.join(" → ");
  cycleEl.textContent = cycle.length ? cycle.join(" → ") + " → …" : "—";
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function edgeKey(a, b) {
  return `${a}->${b}`;
}

function rebuildCycleEdgeSet() {
  cycleEdgeSet = new Set();
  if (!cycle.length) return;
  for (let i = 0; i < cycle.length; i++) {
    const a = cycle[i];
    const b = cycle[(i + 1) % cycle.length];
    cycleEdgeSet.add(edgeKey(a, b));
  }
}

function layoutOrbitalTargets() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const cx = w * 0.5;
  const cy = h * 0.52;
  layoutCenter = { x: cx, y: cy };
  const R = Math.min(w, h) * 0.34;
  const rCycle = Math.min(w, h) * 0.20;

  // Distribución tipo “orbital”: secuencia en espiral suave; ciclo en círculo interno.
  const cycleSet = new Set(cycle);
  const seqLen = sequence.length;

  // Precompute cycle angles
  const cycleAngles = new Map();
  if (cycle.length) {
    for (let i = 0; i < cycle.length; i++) {
      const a = -Math.PI / 2 + (i * (Math.PI * 2)) / cycle.length;
      cycleAngles.set(cycle[i], a);
    }
  }

  for (let i = 0; i < seqLen; i++) {
    const v = sequence[i];
    const idx = nodeIndexByValue.get(v);
    if (idx == null) continue;
    const node = nodes[idx];

    if (cycleSet.has(v) && cycle.length) {
      const a = cycleAngles.get(v) ?? 0;
      node.target.x = cx + Math.cos(a) * rCycle;
      node.target.y = cy + Math.sin(a) * rCycle;
      node.isCycle = true;
    } else {
      // Espiral: ángulo crece, radio se acerca a R
      const t = seqLen <= 1 ? 0 : i / (seqLen - 1);
      const a = -Math.PI / 2 + t * (Math.PI * 2 * 1.2);
      const rr = lerp(R * 0.15, R, Math.pow(t, 0.85));
      node.target.x = cx + Math.cos(a) * rr;
      node.target.y = cy + Math.sin(a) * rr * 0.82;
      node.isCycle = false;
    }
  }
}

function layoutNoCrossTargets() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const cx = w * 0.5;
  const cy = h * 0.52;
  layoutCenter = { x: cx, y: cy };

  const base = Math.min(w, h);
  const rCycle = base * 0.22;
  const tailStep =Math.max(28, Math.min(46, base * 0.055));

  // Sin ciclo aún: una cola suave hacia la derecha (simple y sin cruces).
  if (!cycle.length || cycleStartIndex < 0) {
    for (let i = 0; i < sequence.length; i++) {
      const v = sequence[i];
      const idx = nodeIndexByValue.get(v);
      if (idx == null) continue;
      const node = nodes[idx];
      const x = cx - base * 0.18 + i * tailStep * 0.95;
      const y = cy + Math.sin(i * 0.55) * (base * 0.03);
      node.target.x = x;
      node.target.y = y;
      node.isCycle = false;
    }
    return;
  }

  const entry = cycle[0]; // primer nodo del ciclo (en orden)
  const entryIdx = nodeIndexByValue.get(entry);
  const tailLen = cycleStartIndex; // cantidad de nodos "antes del ciclo"

  // Ángulo del nodo de entrada del ciclo: apunta hacia la izquierda para dejar la cola afuera.
  const entryAngle = Math.PI; // 180°

  // 1) Ciclo en un anillo
  for (let i = 0; i < cycle.length; i++) {
    const v = cycle[i];
    const idx = nodeIndexByValue.get(v);
    if (idx == null) continue;
    const node = nodes[idx];
    const a = entryAngle + (i * (Math.PI * 2)) / cycle.length;
    node.target.x = cx + Math.cos(a) * rCycle;
    node.target.y = cy + Math.sin(a) * rCycle;
    node.isCycle = true;
  }

  // Posición del nodo de entrada (target) para anclar la cola
  const entryTarget = entryIdx != null ? nodes[entryIdx].target : { x: cx - rCycle, y: cy };

  // 2) Cola radial alineada: entry ← ... ← start
  // Esto garantiza que las aristas de la cola no se crucen con el ciclo (tocan el ciclo sólo en entry).
  const dir = { x: Math.cos(entryAngle), y: Math.sin(entryAngle) };
  const normal = { x: -dir.y, y: dir.x };

  for (let i = 0; i < tailLen; i++) {
    const v = sequence[i];
    const idx = nodeIndexByValue.get(v);
    if (idx == null) continue;
    const node = nodes[idx];

    const k = tailLen - i; // distancia (en pasos) desde entry hacia afuera
    const offset = k * tailStep;
    // leve ondulación perpendicular para separar un poco sin generar cruces
    const wiggle = Math.sin(i * 0.9) * Math.min(10, base * 0.012);

    node.target.x = entryTarget.x + dir.x * offset + normal.x * wiggle;
    node.target.y = entryTarget.y + dir.y * offset + normal.y * wiggle;
    node.isCycle = false;
  }
}

function worldLayoutTargets() {
  if (layoutMode === "orbital") layoutOrbitalTargets();
  else layoutNoCrossTargets();
}

function ensureNode(value) {
  const existing = nodeIndexByValue.get(value);
  if (existing != null) return existing;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const node = /** @type {Node} */ ({
    value,
    pos: { x: w * 0.5 + (Math.random() - 0.5) * 24, y: h * 0.52 + (Math.random() - 0.5) * 24 },
    vel: { x: 0, y: 0 },
    target: { x: w * 0.5, y: h * 0.52 },
    radius: 14,
    hue: 185 + (value * 13) % 120,
    isCycle: false,
  });

  const idx = nodes.length;
  nodes.push(node);
  nodeIndexByValue.set(value, idx);
  return idx;
}

function resetSimulation(n) {
  currentValue = n;
  nodes = [];
  nodeIndexByValue = new Map();
  sequence = [];
  cycle = [];
  cycleStartIndex = -1;
  cycleEdgeSet = new Set();
  edgeAnim = null;

  sequence.push(n);
  ensureNode(n);
  worldLayoutTargets();
  updateSidePanel();

  const { next, digits } = sumSquareDigits(n);
  setRuleText(n, next, digits);
  setStatus("Listo. Presiona Iniciar o Paso.");
}

function detectCycleFrom(value) {
  // Encuentra ciclo si volvemos a ver un número.
  // Importante: `sequence` ya incluye el `value` repetido al final.
  const firstIdx = sequence.indexOf(value);
  const lastIdx = sequence.length - 1;
  if (firstIdx >= 0 && firstIdx < lastIdx) {
    // ciclo sin el nodo repetido final
    return { cycle: sequence.slice(firstIdx, lastIdx), startIndex: firstIdx };
  }
  return { cycle: [], startIndex: -1 };
}

function startEdge(fromValue, toValue) {
  const fromIdx = ensureNode(fromValue);
  const toIdx = ensureNode(toValue);
  edgeAnim = { from: fromIdx, to: toIdx, t: 0, done: false };
}

function stepOnce() {
  if (cycle.length || sequence[sequence.length - 1] === 1) {
    return;
  }

  const n = sequence[sequence.length - 1];
  const { next, digits } = sumSquareDigits(n);
  setRuleText(n, next, digits);

  // Si ya vimos "next", cerramos ciclo.
  if (sequence.includes(next)) {
    sequence.push(next);
    ensureNode(next);
    const found = detectCycleFrom(next);
    cycle = found.cycle;
    cycleStartIndex = found.startIndex;
    rebuildCycleEdgeSet();
    worldLayoutTargets();
    startEdge(n, next);
    updateSidePanel();
    if (next === 1) {
      setStatus("Llegó a 1 (feliz).");
    } else {
      setStatus("Ciclo detectado (infeliz).");
    }
    return;
  }

  sequence.push(next);
  ensureNode(next);
  worldLayoutTargets();
  startEdge(n, next);
  updateSidePanel();

  if (next === 1) setStatus("Llegó a 1 (feliz).");
  else setStatus("Iterando…");
}

function bgGrid() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgba(232,236,255,0.06)";
  ctx.lineWidth = 1;
  const step = 42;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEdge(from, to, alpha, width, glow, color) {
  const mx = (from.x + to.x) * 0.5;
  const my = (from.y + to.y) * 0.5;
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Curvatura "cóncava": tiramos el punto de control hacia el centro del layout.
  // Esto se ve más 3Blue1Brown que el offset perpendicular fijo (que suele verse convexo).
  const vx = layoutCenter.x - mx;
  const vy = layoutCenter.y - my;
  const distToCenter = Math.hypot(vx, vy) || 1;
  const nx = vx / distToCenter;
  const ny = vy / distToCenter;

  // Intensidad por modo (más marcada en "sin cruces")
  const concavity = layoutMode === "no_cross" ? 0.46 : 0.28;
  const pull = Math.min(5, distToCenter * concavity);

  // Un toque mínimo perpendicular para evitar que todo quede demasiado "geométrico"
  const perpLen = Math.hypot(dx, dy) || 1;
  const px = -dy / perpLen;
  const py = dx / perpLen;
  const tinySide = Math.min(10, Math.max(2, perpLen * 0.03)) * 0.10;
  // Dirección de curvatura: hacia afuera del centro del layout (lo que pediste: "para el otro lado").
  // +1 = hacia el centro, -1 = hacia afuera
  const curveDir = -1;
  // Mantiene el pequeño componente perpendicular consistente con esa dirección.
  const sideSign = (Math.sign(vx * px + vy * py) || 1) * curveDir;

  const cx = mx + nx * pull * curveDir + px * tinySide * sideSign;
  const cy = my + ny * pull * curveDir + py * tinySide * sideSign;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(cx, cy, to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawNode(node, isCurrent) {
  const v = node.value;
  const x = node.pos.x;
  const y = node.pos.y;

  const base = node.isCycle ? COLORS.pink : COLORS.cyan;
  const halo = node.isCycle ? "rgba(244,114,182,0.18)" : "rgba(103,232,249,0.16)";
  const ring = isCurrent ? COLORS.amber : base;

  // halo
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, node.radius * (node.isCycle ? 2.2 : 2.0), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // body
  ctx.save();
  ctx.shadowColor = ring;
  ctx.shadowBlur = isCurrent ? 18 : 12;
  ctx.fillStyle = "rgba(9,12,22,0.88)";
  ctx.strokeStyle = ring;
  ctx.lineWidth = isCurrent ? 2.4 : 1.6;
  ctx.beginPath();
  ctx.arc(x, y, node.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // text
  ctx.save();
  ctx.fillStyle = COLORS.fg;
  ctx.font = `700 ${Math.max(11, Math.min(14, node.radius))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(v), x, y + 0.5);
  ctx.restore();
}

function tickPhysics(dt) {
  // Relajación tipo “spring” para transiciones suaves.
  const stiffness = 18;
  const damping = 8.5;
  for (const node of nodes) {
    const ax = (node.target.x - node.pos.x) * stiffness;
    const ay = (node.target.y - node.pos.y) * stiffness;
    node.vel.x += ax * dt;
    node.vel.y += ay * dt;
    node.vel.x *= Math.exp(-damping * dt);
    node.vel.y *= Math.exp(-damping * dt);
    node.pos.x += node.vel.x * dt;
    node.pos.y += node.vel.y * dt;
  }
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  bgGrid();

  // Edges existentes (trayectoria completa) como "ghost"
  for (let i = 0; i < Math.max(0, sequence.length - 1); i++) {
    const a = sequence[i];
    const b = sequence[i + 1];
    const ai = nodeIndexByValue.get(a);
    const bi = nodeIndexByValue.get(b);
    if (ai == null || bi == null) continue;
    const A = nodes[ai].pos;
    const B = nodes[bi].pos;

    const inCycle = cycleEdgeSet.has(edgeKey(a, b));
    const col = inCycle ? "rgba(244,114,182,0.35)" : "rgba(103,232,249,0.22)";
    drawEdge(A, B, 1, 1.35, 0, col);
  }

  // Arista animada (punta brillante)
  if (edgeAnim && !edgeAnim.done) {
    const A = nodes[edgeAnim.from].pos;
    const B = nodes[edgeAnim.to].pos;

    const t = easeInOutCubic(edgeAnim.t);
    const P = { x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t) };
    drawEdge(A, B, 1, 2.2, 14, "rgba(251,191,36,0.92)");
    ctx.save();
    ctx.shadowColor = "rgba(251,191,36,0.9)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(251,191,36,0.92)";
    ctx.beginPath();
    ctx.arc(P.x, P.y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Nodes
  const current = sequence[sequence.length - 1];
  for (const node of nodes) {
    drawNode(node, node.value === current);
  }

  // Texto sutil de “resultado”
  ctx.save();
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const tag = cycle.length
    ? `INFELIZ (ciclo de longitud ${cycle.length})`
    : sequence[sequence.length - 1] === 1
      ? "FELIZ (llegó a 1)"
      : "—";
  ctx.fillText(tag, 14, 12);
  ctx.restore();
}

function animate(ts) {
  if (!lastTs) lastTs = ts;
  const rawDt = (ts - lastTs) / 1000;
  lastTs = ts;
  const dt = Math.min(0.033, Math.max(0.001, rawDt));

  tickPhysics(dt);

  // Animación de la arista
  const speed = Number(speedInput.value || 1);
  if (edgeAnim && !edgeAnim.done) {
    edgeAnim.t += dt * (1.2 + speed * 1.35);
    if (edgeAnim.t >= 1) {
      edgeAnim.t = 1;
      edgeAnim.done = true;
    }
  }

  // Avance automático: cuando termina la arista, damos el siguiente paso si está running.
  if (running) {
    if (!edgeAnim || edgeAnim.done) {
      if (cycle.length || sequence[sequence.length - 1] === 1) {
        running = false;
        pauseBtn.disabled = true;
        startBtn.disabled = false;
      } else {
        stepOnce();
      }
    }
  }

  draw();
  requestAnimationFrame(animate);
}

function parseNInput() {
  const v = Number(nInput.value);
  if (!Number.isFinite(v) || v < 1) return 20;
  return Math.floor(v);
}

function start() {
  const n = parseNInput();
  resetSimulation(n);
  running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  setStatus("Reproduciendo…");
  // primer paso inmediato
  stepOnce();
}

function pause() {
  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  setStatus("Pausado.");
}

function step() {
  if (running) return;
  if (!edgeAnim || edgeAnim.done) stepOnce();
}

function randomUnhappy() {
  const n = pickRandomUnhappy();
  nInput.value = String(n);
  resetSimulation(n);
}

function hookEvents() {
  window.addEventListener("resize", () => {
    resizeCanvas();
    worldLayoutTargets();
  });

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  stepBtn.addEventListener("click", step);
  randomBtn.addEventListener("click", randomUnhappy);
  layoutSelect?.addEventListener("change", () => {
    const v = layoutSelect.value === "orbital" ? "orbital" : "no_cross";
    layoutMode = v;
    worldLayoutTargets();
  });

  nInput.addEventListener("change", () => {
    if (running) return;
    resetSimulation(parseNInput());
  });

  // Tecla espacio: play/pause. Enter: iniciar.
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (running) pause();
      else start();
    } else if (e.code === "Enter") {
      if (!running) start();
    } else if (e.key.toLowerCase() === "s") {
      step();
    }
  });
}

function boot() {
  resizeCanvas();
  hookEvents();
  if (layoutSelect) {
    layoutMode = layoutSelect.value === "orbital" ? "orbital" : "no_cross";
  }
  resetSimulation(parseNInput());
  requestAnimationFrame(animate);
}

boot();


