// Fig 6 -- clone and tracking branches. A duplicating mill.
//
// The idea: `git clone` does not just copy the files. It copies the whole
// history, and it adds two things you did not have: a name for the server,
// `origin`, and a bookmark of where the server was, `origin/main`.
//
// The mill stamps a copy of the server's row onto your bench. The pointer board
// then carries two arms. `main` is yours and moves when you commit.
// `origin/main` is where the server was, and moves only when you fetch or push.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 640;
const HEIGHT = 400;

const PLATE = { x: -158, y: -86, w: 316, d: 172, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// The server row sits high and far; your bench sits low and near.
const SERVER_Y = 44;
const SERVER_Z = 26;
const BENCH_Y = -30;
const X0 = -104;
const GAP = 30;

const COMMITS = ["c1", "c2", "c3"];
const SLOT = (i) => X0 + i * GAP;

const MILL_H = 74;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [SLOT(2) + 26, BENCH_Y, MILL_H + 8], [SLOT(0) - 24, SERVER_Y, SERVER_Z + 20]],
  WIDTH, HEIGHT, { pad: 16, azimuth: 54 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -136, y: PLATE.y + PLATE.d - 14, w: 272, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 6, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  const name = (text, x, y) => k.faceTextSvg(k.topMatrix([x, y], 0.1, P, "x"), text, { size: 4.6, tone: "faint" });
  out.push(name("origin · the server", SLOT(0) - 14, SERVER_Y + 16));
  out.push(name("your clone", SLOT(0) - 14, BENCH_Y + 16));
  return out.join("");
}

// A rail bed, used for both the server row and your bench.
function bed(y, z, label) {
  const out = [];
  out.push(S(k.slabOf({ x: X0 - 22, y: y - 13, w: GAP * 2 + 44, d: 26, r: 3 }, z, 2.4, P, 3, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan({ x: X0 - 22, y: y - 13, w: GAP * 2 + 44, d: 26, r: 3 }, 2), z + 2.4, P, 3), { tone: "faint" }));
  for (let i = 0; i < 3; i++) {
    const x = SLOT(i);
    out.push(L(k.ring(x, y - 6, 1.4, z + 2.4, P, 12), { tone: "lo" }));
    out.push(L(k.ring(x, y + 6, 1.4, z + 2.4, P, 12), { tone: "lo" }));
    out.push(D([at([x, y, z + 2.4])], { size: 0.5 }));
  }
  out.push(k.faceTextSvg(k.topMatrix([X0 + 44, y + 9], z + 2.5, P, "x"), label, { size: 3.6, tone: "faint", anchor: "middle" }));
  return out.join("");
}

// The plinth that raises the server row.
function plinth() {
  const out = [];
  out.push(S(k.slabOf({ x: X0 - 26, y: SERVER_Y - 17, w: GAP * 2 + 52, d: 34, r: 3 }, 0, SERVER_Z, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan({ x: X0 - 26, y: SERVER_Y - 17, w: GAP * 2 + 52, d: 34, r: 3 }, 2.2), SERVER_Z, P, 3), { tone: "faint" }));
  for (const [x, y] of k.corners({ x: X0 - 22, y: SERVER_Y - 13, w: GAP * 2 + 44, d: 26, r: 3 }, 12)) {
    out.push(D([at([x, y, SERVER_Z])], { size: 0.5 }));
  }
  return out.join("");
}

// A wagon, the same on both rows once the copy lands.
function wagon(id, x, y, z, lit, ghost) {
  const g = [];
  const frame = { x: x - 10, y: y - 6, w: 20, d: 12, r: 2 };
  g.push(S(k.slabOf(frame, z + 2.4, 2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 8, y: y - 5, w: 16, d: 10, r: 1.4 };
  g.push(S(k.slabOf(box, z + 4.4, 7, P, 3, 0.5), ghost ? { tone: "lo", crease: "faint" } : { tone: "hi", className: "wg-body", lit, crease: lit ? "none" : "lo" }));
  g.push(L(k.planOutline(k.insetPlan(box, 1.6), z + 11.4, P, 3), { tone: "faint" }));
  for (const [dx, dy] of [[-6.5, -5.4], [6.5, -5.4], [-6.5, 5.4], [6.5, 5.4]]) {
    g.push(S(k.cylinder(x + dx, y + dy, 2, z + 0.6, 2, P, 14), { tone: "mid" }));
    g.push(L(k.ring(x + dx, y + dy, 2, z + 2.6, P, 14), { tone: "faint" }));
  }
  g.push(`<g data-label>${k.faceTextSvg(k.topMatrix([x, y], z + 11.4, P, "x"), id, { size: 4, tone: "lo", anchor: "middle" })}</g>`);
  return g.join("");
}

// The mill: a gantry over your bench row, whose head travels along it and
// stamps down at each slot.
function mill() {
  const out = [];
  const x0 = SLOT(0) - 22, x1 = SLOT(2) + 22;
  for (const x of [x0, x1]) {
    for (const y of [BENCH_Y - 13, BENCH_Y + 13]) {
      out.push(S(k.cylinder(x, y, 2.6, 0, MILL_H, P, 16), { tone: "mid", crease: "none" }));
      out.push(S(k.cylinder(x, y, 3.8, 0, 2, P, 16), { tone: "mid" }));
      out.push(D([at([x, y, 0])], { size: 0.5 }));
      for (const [dx, dy] of [[-5, -6], [5, -6], [-5, 6], [5, 6]])
        out.push(S(k.cylinder(x + dx, y + dy, 1, 0, 1.5, P, 10), { tone: "lo" }));
    }
    out.push(S(k.slabOf({ x: x - 3, y: BENCH_Y - 14, w: 6, d: 28, r: 1.6 }, MILL_H, 4, P, 3, 0.4), { tone: "mid" }));
  }
  // the beam the head runs on
  out.push(S(k.slabOf({ x: x0 - 3, y: BENCH_Y - 3, w: x1 - x0 + 6, d: 6, r: 1.6 }, MILL_H + 4, 3.4, P, 3, 0.4), { tone: "mid" }));
  out.push(`<g data-head></g>`);
  return out.join("");
}

// A board with one position per commit. An arm sits at the commit it names,
// so the distance between the two arms is how far your branch has drifted from
// origin.
const BOARD = { x: 92, y: -74, w: 26, d: 78, r: 3 };
const BOARD_POS = (i) => BOARD.y + 16 + i * 20;
function pointers() {
  const out = [];
  out.push(S(k.slabOf(BOARD, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 1.6), 3, P), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([BOARD.x + BOARD.w / 2, BOARD.y + 8], 3.1, P, "x"), "pointers", { size: 3.2, tone: "faint", anchor: "middle" }));
  for (let i = 0; i < 3; i++) {
    out.push(L(k.lineOnTop([BOARD.x + 3, BOARD_POS(i)], [BOARD.x + 9, BOARD_POS(i)], 3.1, P), { tone: "faint" }));
    out.push(S(k.cylinder(BOARD.x + 6, BOARD_POS(i), 2.6, 3, 1.4, P, 16), { tone: "mid" }));
    out.push(D([at([BOARD.x + 6, BOARD_POS(i), 4.4])], { size: 0.4, tone: "faint" }));
  }
  for (const name of ["main", "origin"]) out.push(`<g data-pointer="${name}"></g>`);
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A duplicating mill. The server's row of commits stands high on a plinth. The mill stamps an identical row onto the low bench, and a pointer board then carries two arms: main for your branch and origin/main for where the server was.",
  body: [plate(), plinth(), bed(SERVER_Y, SERVER_Z, "server row"), bed(BENCH_Y, 0, "your row"),
    `<g data-server></g>`, `<g data-local></g>`, mill(), pointers()],
});

const live = `
const P = ${JSON.stringify(P)};
const COMMITS = ${JSON.stringify(COMMITS)};
const X0 = ${X0};
const GAP = ${GAP};
const SLOT = ${SLOT.toString()};
const SERVER_Y = ${SERVER_Y};
const SERVER_Z = ${SERVER_Z};
const BENCH_Y = ${BENCH_Y};
const MILL_H = ${MILL_H};
const BOARD = ${JSON.stringify(BOARD)};
const BOARD_POS = ${BOARD_POS.toString()};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const serverG = svg.querySelector("[data-server]");
const localG = svg.querySelector("[data-local]");
const headG = svg.querySelector("[data-head]");

function wagon(id, x, y, z, lit, ghost) {
  const g = [];
  const frame = { x: x - 10, y: y - 6, w: 20, d: 12, r: 2 };
  g.push(solidSvg(slabOf(frame, z + 2.4, 2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 8, y: y - 5, w: 16, d: 10, r: 1.4 };
  g.push(solidSvg(slabOf(box, z + 4.4, 7, P, 3, 0.5), ghost ? { tone: "lo", crease: "faint" } : { tone: "hi", className: "wg-body", lit, crease: lit ? "none" : "lo" }));
  g.push(lineSvg(planOutline(insetPlan(box, 1.6), z + 11.4, P, 3), { tone: "faint" }));
  for (const [dx, dy] of [[-6.5, -5.4], [6.5, -5.4], [-6.5, 5.4], [6.5, 5.4]]) {
    g.push(solidSvg(cylinder(x + dx, y + dy, 2, z + 0.6, 2, P, 14), { tone: "mid" }));
    g.push(lineSvg(ring(x + dx, y + dy, 2, z + 2.6, P, 14), { tone: "faint" }));
  }
  g.push(faceTextSvg(topMatrix([x, y], z + 11.4, P, "x"), id, { size: 4, tone: "lo", anchor: "middle" }));
  return g.join("");
}

// copied: how many commits have landed on the bench.
let copied = 0;
let mode = "idle", t = 0, frame = 0, last = 0, visible = false;
let touring = !still.matches, dwell = 1.6, ptrShown = "";

const serverSvg = () => COMMITS.map((id, i) => wagon(id, SLOT(i), SERVER_Y, SERVER_Z, false, false)).join("");
const localSvg = (upto) => COMMITS.map((id, i) => (i < upto ? wagon(id, SLOT(i), BENCH_Y, 0, i === upto - 1, false) : "")).join("");

function headSvg(x, z) {
  const out = [];
  out.push(lineSvg(rise([x, BENCH_Y], MILL_H + 4, z, P), { tone: "faint" }));
  // both ends of the cable need something to land on: the beam above, the
  // head below
  out.push(dotsSvg([iso([x, BENCH_Y, MILL_H + 4], P), iso([x, BENCH_Y, z], P)], { size: 0.5, tone: "faint" }));
  out.push(solidSvg(cylinder(x, BENCH_Y, 2.2, z - 4, 4, P, 14), { tone: "mid" }));
  out.push(solidSvg(slabOf({ x: x - 9, y: BENCH_Y - 7, w: 18, d: 14, r: 2 }, z - 9, 5, P, 3, 0.3), { tone: "hi" }));
  out.push(dotsSvg([iso([x, BENCH_Y, z - 9], P)], { size: 0.7, tone: "hi" }));
  return out.join("");
}

// An arm sits at its board position and reaches toward its commit. Height on
// the board is the commit index, so the two arms separate as history moves.
function pointerSvg(which, index) {
  const px = BOARD.x + (which === "main" ? 6 : 15);
  const py = BOARD_POS(Math.max(0, Math.min(2, index)));
  const tx = SLOT(Math.max(0, Math.min(2, index)));
  const ang = Math.atan2(tx - px, BENCH_Y - py);
  const len = which === "main" ? 28 : 22, half = 1.9;
  const dx = Math.sin(ang), dy = Math.cos(ang);
  const nx = dy, ny = -dx;
  const ringPts = [
    [px - nx * half, py - ny * half],
    [px + dx * len - nx, py + dy * len - ny],
    [px + dx * len + nx, py + dy * len + ny],
    [px + nx * half, py + ny * half],
  ];
  const out = [];
  out.push(solidSvg(extrude(ringPts, 4, 1.8, P), { tone: "hi", lit: true }));
  const hx = px + dx * len, hy = py + dy * len;
  out.push(solidSvg(cylinder(hx, hy, 2.4, 4, 2, P, 16), { tone: "mid" }));
  out.push(dotsSvg([iso([hx, hy, 6], P)], { size: 0.65, tone: "hi" }));
  return out.join("");
}

function paint() {
  serverG.innerHTML = serverSvg();
  localG.innerHTML = localSvg(copied);
  const key = "main" + Math.max(1, copied) + "/origin" + COMMITS.length;
  if (ptrShown !== key) {
    ptrShown = key;
    svg.querySelector('[data-pointer="main"]').innerHTML = pointerSvg("main", Math.max(1, copied));
    svg.querySelector('[data-pointer="origin"]').innerHTML = pointerSvg("origin", COMMITS.length);
  }
}

function setText(text) {
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function describe() {
  if (mode === "clone") return "git clone · stamping copy " + copied + " of " + COMMITS.length;
  if (copied === 0) return "before · the server has " + COMMITS.length + " commits, your bench has none";
  if (copied < COMMITS.length) return "clone in progress · " + copied + " of " + COMMITS.length + " on your bench";
  return "cloned · main and origin/main both sit at " + COMMITS[COMMITS.length - 1];
}

function startClone() {
  if (mode !== "idle" || copied > 0) return;
  if (still.matches) { copied = COMMITS.length; paint(); return; }
  mode = "clone"; t = 0; run();
}
function windBack() { copied = 0; mode = "idle"; t = 0; headG.innerHTML = ""; paint(); }
function poke() {
  touring = false;
  clearTimeout(poke.t);
  if (mode === "idle") { if (copied === 0) startClone(); else windBack(); }
  poke.t = setTimeout(() => { touring = !still.matches; dwell = 1.9; run(); }, 4200);
}

const MOVE = 1.5;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (mode === "clone") {
    t = Math.min(1, t + dt / MOVE);
    const x = SLOT(Math.min(copied, COMMITS.length - 1));
    const e = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
    headG.innerHTML = headSvg(x, MILL_H - 6 - e * (MILL_H - 24));
    if (t >= 1) {
      copied += 1;
      t = 0;
      if (copied >= COMMITS.length) { mode = "idle"; headG.innerHTML = ""; }
      paint();
    }
  } else if (touring) {
    dwell -= dt;
    if (dwell <= 0) {
      if (copied === 0) startClone();
      else windBack();
      dwell = 2.0;
    }
  }
  if (mode === "idle") headG.innerHTML = "";
  setText(describe());
  frame = visible && (mode !== "idle" || touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

stage.addEventListener("click", () => poke());
stage.addEventListener("keydown", (e) => { if (e.key === "c" || e.key === "C" || e.key === " ") { e.preventDefault(); poke(); } });
paint();
setText(describe());
`;

const body = navHtml("clone", "Git clone", "and tracking branches") + k.plateHtml({
  fig: "Fig 3",
  title: "Clone, and tracking branches",
  hint: "Click to clone · c to clone",
  readout: "before",
  keys: [
    { mark: "raised", label: "The server row: the commits that are on origin" },
    { mark: "lit", label: "Your clone: an independent copy of the history" },
    { mark: "line", label: "The mill is git clone: it stamps the whole history" },
    { mark: "line", label: "The board holds main and origin/main separately" },
  ],
  caption: "git clone copies the whole history, not only the files, and adds two things. origin is a name for the server. origin/main is a bookmark of where the server's main was when you cloned. Your main moves when you commit. origin/main moves only when you fetch or push, which is why the two arms can part.",
  body: '<div class="iso-stage" tabindex="0" data-touch-hint="Tap to clone the server row" role="group" aria-label="Clone: copy the whole history and add a tracking branch">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git clone", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "clone-light.html" : "clone.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
