// Fig 4 -- pull requests. A goods gate with a review lamp.
//
// The idea: a pull request is a gate between your siding and the main line. The
// branch wagons cannot join main on their own; they queue at the gate, a
// reviewer inspects them, and only then does the gate open and the wagons roll
// onto main as one merged train. Beginners see "my branch cannot merge itself";
// experienced devs see the merge commit and the checks that gate it.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 620;
const HEIGHT = 400;

const PLATE = { x: -150, y: -80, w: 300, d: 160, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const MAIN_Y = -8;
const SIDE_Y = 40;

const RAIL_X0 = -118;
const RAIL_X1 = 74;
const SIDE_X0 = -62;
const SIDE_X1 = 26;

// The gate sits where the siding meets the main line.
const GATE_X = 34;
const POINTS_X = SIDE_X0;

// Commits: main runs A-B-C-M; the branch ran D-E off B and is queued at the
// gate. M is the merge commit that only exists once the gate opens.
const COMMITS = [
  { id: "A", x: -106, y: MAIN_Y, br: "main" },
  { id: "B", x: -64, y: MAIN_Y, br: "main" },
  { id: "C", x: -20, y: MAIN_Y, br: "main" },
  { id: "D", x: -30, y: SIDE_Y, br: "side" },
  { id: "E", x: 6, y: SIDE_Y, br: "side" },
  { id: "M", x: 52, y: MAIN_Y, br: "main", merge: true },
];
const GATE = ["D", "E"];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [RAIL_X1, MAIN_Y, 20], [RAIL_X0, SIDE_Y, 20]],
  WIDTH, HEIGHT, { pad: 18, azimuth: 55 },
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
  const strip = { x: -128, y: PLATE.y + PLATE.d - 15, w: 256, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  return out.join("");
}

function track() {
  const out = [];
  out.push(S(k.slabOf({ x: RAIL_X0 - 8, y: MAIN_Y - 12, w: RAIL_X1 - RAIL_X0 + 16, d: 18, r: 3 }, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: SIDE_X0 - 8, y: SIDE_Y - 11, w: SIDE_X1 - SIDE_X0 + 16, d: 18, r: 3 }, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  for (let x = RAIL_X0; x <= RAIL_X1; x += 16) out.push(S(k.slabOf({ x, y: MAIN_Y - 7, w: 7, d: 14, r: 1 }, 0.7, 1.6, P, 2, 0.3), { tone: "mid" }));
  for (let x = SIDE_X0; x <= SIDE_X1; x += 15) out.push(S(k.slabOf({ x, y: SIDE_Y - 6.5, w: 7, d: 13, r: 1 }, 0.7, 1.6, P, 2, 0.3), { tone: "mid" }));
  for (const off of [-3.4, 3.4]) out.push(S(k.slabOf({ x: RAIL_X0, y: MAIN_Y + off, w: RAIL_X1 - RAIL_X0, d: 1.8, r: 0.8 }, 2.3, 1.8, P, 2, 0.3), { tone: "mid" }));
  for (const off of [-3.4, 3.4]) out.push(S(k.slabOf({ x: SIDE_X0, y: SIDE_Y + off, w: SIDE_X1 - SIDE_X0, d: 1.8, r: 0.8 }, 2.3, 1.8, P, 2, 0.3), { tone: "mid" }));
  // the lead the branch takes up to main, and the points at the west end
  for (const off of [-1.6, 1.6]) out.push(L(k.lineOnTop([SIDE_X1 + off, SIDE_Y - 3.4 + off * 0.4], [GATE_X + off, MAIN_Y + 3.4 + off * 0.4], 3.9, P), { tone: "mid" }));
  for (let s = 0; s <= 3; s++) {
    const x = SIDE_X1 + 2 + s * 6, y = SIDE_Y - s * 8;
    out.push(L(k.lineOnTop([x - 4, y - 4], [x + 4, y + 4], 2.6, P), { tone: "lo" }));
    out.push(D([at([x - 4, y - 4, 2.6]), at([x + 4, y + 4, 2.6])], { size: 0.4 }));
  }
  out.push(`<g data-blade>${S(k.slabOf({ x: POINTS_X - 2, y: SIDE_Y - 4, w: 13, d: 2.2, r: 1 }, 2.3, 1.4, P, 2), { tone: "hi" })}</g>`);
  for (const [x, y] of [[RAIL_X1, MAIN_Y], [SIDE_X1, SIDE_Y]]) {
    out.push(S(k.slabOf({ x, y: y - 7, w: 5, d: 14, r: 1.2 }, 0, 8, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 2.5, y - 4, 8]), at([x + 2.5, y + 4, 8])], { size: 0.45 }));
  }
  return out.join("");
}

function wagon(c, lit) {
  const g = [];
  g.push(S(k.slabOf({ x: c.x - 11, y: c.y - 6, w: 22, d: 12, r: 2 }, 4.1, 2.2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: c.x - 9, y: c.y - 5, w: 18, d: 10, r: 1.5 };
  g.push(S(k.slabOf(box, 6.3, 8, P, 3, 0.5), { tone: "hi", className: "wg-body", lit, crease: lit ? "none" : "lo" }));
  g.push(L(k.planOutline(k.insetPlan(box, 1.8), 14.3, P, 3), { tone: "faint" }));
  g.push(L(k.planOutline(k.insetPlan(box, 3.4), 14.4, P, 3), { tone: "lo" }));
  for (const dx of [-4.4, 0, 4.4]) {
    g.push(L(k.lineOnTop([c.x + dx, c.y - 5], [c.x + dx, c.y - 5], 6.6, P), { tone: "faint" }));
    g.push(L(k.lineOnTop([c.x + dx, c.y + 5], [c.x + dx, c.y + 5], 6.6, P), { tone: "faint" }));
  }
  g.push(S(k.slabOf({ x: c.x + 3, y: c.y - 2.4, w: 5, d: 4.8, r: 0.8 }, 14.3, 0.9, P, 3, 0.3), { tone: "lo" }));
  for (const dx of [-11, 11])
    g.push(S(k.slabOf({ x: c.x + dx - 1, y: c.y - 6, w: 2, d: 12, r: 0.6 }, 3.6, 3.2, P, 2, 0.3), { tone: "mid" }));
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]]) {
    g.push(S(k.cylinder(c.x + dx, c.y + dy, 2.2, 1.2, 2.4, P, 16), { tone: "mid" }));
    g.push(L(k.ring(c.x + dx, c.y + dy, 2.2, 3.6, P, 16), { tone: "faint" }));
  }
  // the merge wagon wears a coupling collar on both shoulders
  if (c.merge) {
    for (const dx of [-9, 9]) {
      g.push(S(k.cylinder(c.x + dx, c.y, 2.6, 6.3, 2, P, 16), { tone: "mid" }));
      g.push(L(k.ring(c.x + dx, c.y, 2.6, 8.3, P, 16), { tone: "faint" }));
    }
  }
  g.push(`<g data-label>${k.faceTextSvg(k.topMatrix([c.x, c.y], 14.3, P, "x"), c.id, { size: 4.5, tone: "lo", anchor: "middle" })}</g>`);
  return `<g data-wagon="${c.id}">${g.join("")}</g>`;
}

// The gate: two posts and a barrier arm that lifts when the review clears.
function gate() {
  const out = [];
  for (const [x, y] of [[GATE_X - 7, MAIN_Y], [GATE_X + 7, MAIN_Y]]) {
    out.push(S(k.cylinder(x, y, 3, 0, 34, P, 18), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x, y, 4.4, 0, 2, P, 18), { tone: "mid" }));
    // gusset at the foot and a collar at the top, so the post is not a bare tube
    out.push(S(k.slabOf({ x: x - 5.5, y: y - 5.5, w: 11, d: 11, r: 2 }, 0, 1.4, P, 4, 0.3), { tone: "mid" }));
    out.push(L(k.ring(x, y, 3, 4, P, 18), { tone: "faint" }));
    out.push(L(k.sideArc(x, y, 3, 20, P, 12), { tone: "faint" }));
    out.push(D([at([x, y, 0])], { size: 0.5 }));
  }
  // header beam the barrier hangs from
  out.push(S(k.slabOf({ x: GATE_X - 10, y: MAIN_Y - 3, w: 20, d: 6, r: 1.5 }, 34, 3.4, P, 3, 0.4), { tone: "mid" }));
  // the barrier arm itself, rebuilt per frame as it swings
  out.push(`<g data-arm></g>`);
  // the review lamp on the header
  out.push(S(k.cylinder(GATE_X + 4, MAIN_Y, 4.6, 37.4, 5, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(GATE_X + 4, MAIN_Y, 4.6, 37.4, 42.4, 28, P), { tone: "lo" }));
  out.push(`<g data-lamp></g>`);
  return out.join("");
}

function clutter() {
  const out = [];
  // reviewer's desk with the approve button
  const desk = { x: -142, y: -76, w: 66, d: 22, r: 3 };
  out.push(S(k.slabOf(desk, 0, 3.4, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(desk, 1.6), 3.4, P), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([desk.x + desk.w / 2, desk.y + 4], 3.5, P, "x"), "review", { size: 3.4, tone: "faint", anchor: "middle" }));
  out.push(`<g data-btn>${S(k.cylinder(desk.x + desk.w / 2, desk.y + 14, 5.6, 3.4, 2.8, P, 24), { tone: "hi", lit: true })}</g>`);
  // a signal gantry over the main line
  const bx = 88;
  for (const y of [MAIN_Y - 14, MAIN_Y + 14]) {
    out.push(S(k.cylinder(bx, y, 2.4, 0, 26, P, 20), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(bx, y, 3.6, 0, 2, P, 20), { tone: "mid" }));
  }
  out.push(S(k.slabOf({ x: bx - 2.4, y: MAIN_Y - 14, w: 4.8, d: 32, r: 2 }, 26, 3, P, 3, 0.4), { tone: "mid" }));
  for (const dy of [-9, 9]) {
    out.push(S(k.cylinder(bx, MAIN_Y + dy, 3.8, 29, 4, P, 22), { tone: "mid" }));
    out.push(D([at([bx, MAIN_Y + dy, 33.4], P)], { size: 0.7 }));
  }
  // crates for texture
  out.push(S(k.slabOf({ x: 96, y: 52, w: 22, d: 14, r: 2 }, 0, 12, P, 4, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: 84, y: 58, w: 14, d: 10, r: 2 }, 0, 7, P, 4, 0.4), { tone: "mid" }));
  return out.join("");
}

function wagons() {
  return `<g data-depth>${COMMITS.map((c) => wagon(c, false)).join("")}</g>`;
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A goods gate between a branch siding and the main line. Two wagons wait at the barrier while the review lamp is red; when it clears, the barrier lifts and the wagons roll onto the main line behind a new merge wagon.",
  body: [plate(), track(), wagons(), gate(), clutter()],
});

const live = `
const P = ${JSON.stringify(P)};
const COMMITS = ${JSON.stringify(COMMITS)};
const GATE = ${JSON.stringify(GATE)};
const MAIN_Y = ${MAIN_Y};
const SIDE_Y = ${SIDE_Y};
const SIDE_X1 = ${SIDE_X1};
const GATE_X = ${GATE_X};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const armG = svg.querySelector("[data-arm]");
const lampG = svg.querySelector("[data-lamp]");
const blade = svg.querySelector("[data-blade]");
const layer = svg.querySelector("[data-depth]");
const wagonEls = Object.fromEntries(COMMITS.map((c) => [c.id, {
  root: layer.querySelector('[data-wagon="' + c.id + '"]'),
  body: layer.querySelector('[data-wagon="' + c.id + '"] .wg-body'),
  label: layer.querySelector('[data-wagon="' + c.id + '"] [data-label] text'),
}]));
const byId = Object.fromEntries(COMMITS.map((c) => [c.id, c]));
const SLOT = { D: -30, E: 6 };

// phase: "queued" -> "running" -> "merged"
let phase = "queued", t = 0, frame = 0, last = 0, visible = false, armShown = "", lampShown = "";
// The tour opens the gate, then closes it again, so the figure explains
// itself without a click. Held still under reduced motion.
let touring = !still.matches, dwell = 1.5;
let open = 0;

function armSvg(angle) {
  const out = [];
  const len = 26, segs = 8;
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs;
    out.push(solidSvg(cylinder(GATE_X - 7 + Math.cos(angle) * len * t0, MAIN_Y + Math.sin(angle) * len * t0, 1.5, 30, (len / segs) + 0.3, P, 12), { tone: "hi", crease: "none" }));
  }
  const hx = GATE_X - 7 + Math.cos(angle) * len, hy = MAIN_Y + Math.sin(angle) * len;
  out.push(solidSvg(cylinder(hx, hy, 2.6, 29.4, 2.4, P, 16), { tone: "mid" }));
  out.push(dotsSvg([iso([hx, hy, 32.4], P)], { size: 0.8, tone: "hi" }));
  return out.join("");
}

function paint() {
  const merged = phase === "merged";
  for (const c of COMMITS) {
    const w = wagonEls[c.id];
    if (c.id === "M") { w.root.setAttribute("display", merged ? "inline" : "none"); continue; }
    if (GATE.indexOf(c.id) >= 0 && merged) { w.root.setAttribute("display", "none"); continue; }
    w.root.setAttribute("display", "inline");
  }
}

function describe() {
if (phase === "queued") return "review pending · D and E held at the gate";
if (phase === "running") return "approved · merging D and E";
return "merged · M has two parents: C and E";
}

function approve() {
  if (phase !== "queued") return;
  if (still.matches) { phase = "merged"; paint(); return; }
  phase = "running";
  t = 0;
  paint();
  run();
}

// Put the wagons back on the branch road and drop the barrier again.
function reset() {
  phase = "queued";
  t = 0;
  open = 0;
  for (const id of GATE) wagonEls[id].root.removeAttribute("transform");
  paint();
}

// A reader's own action takes over; the tour resumes shortly after.
function poke() {
  touring = false;
  clearTimeout(poke.t);
  approve();
  poke.t = setTimeout(() => { touring = !still.matches; dwell = 1.7; run(); }, 4200);
}

const MOVE = 2.4;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (phase === "running") {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    open = Math.min(1, e / 0.3);
    // each gated wagon slides along its own road onto the main line
    for (const id of GATE) {
      const w = wagonEls[id];
      const start = SLOT[id];
      const end = GATE_X - 6;
      const leg1 = Math.max(0, Math.min(1, (e - 0.3 - GATE.indexOf(id) * 0.18) / 0.34));
      const leg2 = Math.max(0, Math.min(1, (e - 0.3 - GATE.indexOf(id) * 0.18 - 0.34) / 0.34));
      const c = byId[id];
      const x = start + (SIDE_X1 + 2 - start) * leg1 + (end - (SIDE_X1 + 2)) * leg2;
      const y = SIDE_Y + (MAIN_Y - SIDE_Y) * leg2;
      w.root.setAttribute("transform", translateAlong(P, [x - c.x, y - c.y, 0]));
    }
    if (t >= 1) { phase = "merged"; open = 0; paint(); }
  } else if (touring) {
    dwell -= dt;
    if (dwell <= 0) {
      if (phase === "queued") approve(); else reset();
      dwell = 1.8;
    }
  }
  // the barrier arm swings up as the gate opens
  const angle = -1.45 + open * 1.35;
  const key = angle.toFixed(3);
  if (armShown !== key) { armShown = key; armG.innerHTML = armSvg(angle); }
  const lit = phase !== "queued";
  if (lampShown !== String(lit)) {
    lampShown = String(lit);
    lampG.innerHTML = dotsSvg([iso([GATE_X + 4, MAIN_Y, 42.9], P)], { size: lit ? 1.25 : 0.95, tone: lit ? "hi" : "faint" });
  }
  blade.setAttribute("transform", translateAlong(P, [0, phase === "queued" ? -1.2 : 2.4, 0]));
  // the approve button holds itself down once review is cleared
  btn.setAttribute("transform", translateAlong(P, [0, 0, phase === "queued" ? 0 : -0.8]));
  const text = describe();
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
  frame = visible && (phase === "running" || touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

const btn = svg.querySelector("[data-btn]");
btn.style.cursor = "pointer";
btn.addEventListener("click", () => poke());
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); poke(); } });
paint();
armG.innerHTML = armSvg(-1.45);
lampG.innerHTML = dotsSvg([iso([GATE_X + 4, MAIN_Y, 42.9], P)], { size: 0.95, tone: "faint" });
if (readout.textContent !== describe()) readout.textContent = describe();
`;

const body = navHtml("pr", "Git pull request", "the review gate") + k.plateHtml({
  fig: "Fig 4",
  title: "Pull request — the gate",
  hint: "Click approve or press space to clear review",
  readout: "pull request open",
  keys: [
    { mark: "lit", label: "Review cleared: the gate can open" },
    { mark: "raised", label: "Wagons waiting on the branch road" },
    { mark: "line", label: "Barrier arm: down while review is pending" },
    { mark: "line", label: "Desk: approve the review (click or space)" },
  ],
  caption: "A pull request is a gate, not a move. D and E sit on the branch road and cannot reach main on their own: the barrier is down and the lamp is dark. Once a reviewer clears it, the barrier lifts, the wagons run onto main, and M appears with two parents, C and E.",
  body: '<div class="iso-stage" tabindex="0" role="group" aria-label="Pull request: a branch merging into main through a review gate">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git pull requests", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "pull-request-light.html" : "pull-request.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);