// Fig 3 -- rebase. A permanent-way gantry with a rail bed that can be shifted.
//
// The idea: rebase does not merge. It lifts your branch's wagons off their bed
// and sets them down on top of a different base commit, so the same changes get
// new commit ids and the branch becomes a straight line again. Beginners see
// "my commits changed id"; experienced devs see why the history is now linear.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 620;
const HEIGHT = 400;

const PLATE = { x: -150, y: -80, w: 300, d: 160, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// Two beds at different heights: the old base and the new base. Rebasing moves
// the branch wagons from the lower bed up onto the raised one.
const OLD_Y = 34;
const NEW_Y = -22;
const OLD_Z = 2.3;
const NEW_Z = 12;

const X0 = -116;
const X1 = 60;

// Commits. A-B is shared history. D-E were made on top of A; rebasing onto B
// replays them, so they get new ids (D' and E') and no merge commit appears.
const SHARED = ["A", "B"];
const BRANCH = ["D", "E"];
const POS = { A: -104, B: -60, D: -16, E: 28 };

const GANTRY_X = -6;
const GANTRY_H = 70;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [X1 + 16, OLD_Y, NEW_Z + 20], [X0 - 16, NEW_Y, NEW_Z + 20]],
  WIDTH, HEIGHT, { pad: 18, azimuth: 54 },
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

// Trestle legs stand on the plate, so they paint before the bed they hold up.
function trestle() {
  const out = [];
  for (const x of [X0 + 4, (X0 + X1) / 2, X1 - 4]) {
    for (const dy of [-6, 6]) {
      out.push(S(k.cylinder(x, NEW_Y + dy, 1.5, 0, NEW_Z - 0.7, P, 14), { tone: "mid" }));
      out.push(D([at([x, NEW_Y + dy, 0])], { size: 0.4 }));
    }
    // cross brace, riveted at both ends onto the leg axes
    out.push(L(k.lineOnTop([x, NEW_Y - 6], [x, NEW_Y + 6], NEW_Z - 4.2, P), { tone: "faint" }));
    out.push(D([at([x, NEW_Y - 6, NEW_Z - 4.2]), at([x, NEW_Y + 6, NEW_Z - 4.2])], { size: 0.45 }));
  }
  return out.join("");
}

// The raised bed: a trestle of legs holding a higher rail.
function newBed() {
  const out = [];
  out.push(S(k.slabOf({ x: X0 - 10, y: NEW_Y - 9, w: X1 - X0 + 20, d: 15, r: 3 }, NEW_Z - 0.7, 0.7, P, 3), { tone: "lo", crease: "none" }));
  for (let x = X0; x <= X1; x += 17) out.push(S(k.slabOf({ x, y: NEW_Y - 6.5, w: 7, d: 13, r: 1 }, 0.7, 1.5, P, 2, 0.3), { tone: "mid" }));
  for (const off of [-3.4, 3.4])
    out.push(S(k.slabOf({ x: X0, y: NEW_Y + off, w: X1 - X0, d: 1.8, r: 0.8 }, NEW_Z + 2.3, 1.8, P, 2, 0.3), { tone: "hi" }));
  // cast label on the bed face
  out.push(k.faceTextSvg(k.topMatrix([X1 - 22, NEW_Y + 9.5], 0.1, P, "x"), "new base", { size: 4.2, tone: "faint" }));
  return out.join("");
}

function oldBed() {
  const out = [];
  out.push(S(k.slabOf({ x: X0 - 10, y: OLD_Y - 9, w: X1 - X0 + 20, d: 15, r: 3 }, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  for (let x = X0; x <= X1; x += 17) out.push(S(k.slabOf({ x, y: OLD_Y - 6.5, w: 7, d: 13, r: 1 }, 0.7, 1.5, P, 2, 0.3), { tone: "mid" }));
  for (const off of [-3.4, 3.4])
    out.push(S(k.slabOf({ x: X0, y: OLD_Y + off, w: X1 - X0, d: 1.8, r: 0.8 }, 2.3, 1.8, P, 2, 0.3), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([X1 - 22, OLD_Y + 9.5], 0.1, P, "x"), "old base", { size: 4.2, tone: "faint" }));
  return out.join("");
}

function wagon(id, bed, lit) {
  const x = POS[id];
  const y = bed === "new" ? NEW_Y : OLD_Y;
  const z = bed === "new" ? NEW_Z : 0;
  const g = [];
  g.push(S(k.slabOf({ x: x - 11, y: y - 6, w: 22, d: 12, r: 2 }, z + 4.1, 2.2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 9, y: y - 5, w: 18, d: 10, r: 1.5 };
  g.push(S(k.slabOf(box, z + 6.3, 8, P, 3, 0.5), { tone: "hi", className: "wg-body", lit, crease: lit ? "none" : "lo" }));
  g.push(L(k.planOutline(k.insetPlan(box, 1.8), z + 14.3, P, 3), { tone: "faint" }));
  g.push(L(k.planOutline(k.insetPlan(box, 3.4), z + 14.4, P, 3), { tone: "lo" }));
  for (const dx of [-4.4, 0, 4.4]) {
    g.push(L(k.lineOnTop([x + dx, y - 5], [x + dx, y - 5], z + 6.6, P), { tone: "faint" }));
    g.push(L(k.lineOnTop([x + dx, y + 5], [x + dx, y + 5], z + 6.6, P), { tone: "faint" }));
  }
  g.push(S(k.slabOf({ x: x + 3, y: y - 2.4, w: 5, d: 4.8, r: 0.8 }, z + 14.3, 0.9, P, 3, 0.3), { tone: "lo" }));
  for (const dx of [-11, 11])
    g.push(S(k.slabOf({ x: x + dx - 1, y: y - 6, w: 2, d: 12, r: 0.6 }, z + 3.6, 3.2, P, 2, 0.3), { tone: "mid" }));
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]]) {
    g.push(S(k.cylinder(x + dx, y + dy, 2.2, z + 1.2, 2.4, P, 16), { tone: "mid" }));
    g.push(L(k.ring(x + dx, y + dy, 2.2, z + 3.6, P, 16), { tone: "faint" }));
  }
  g.push(`<g data-label>${k.faceTextSvg(k.topMatrix([x, y], z + 14.3, P, "x"), id, { size: 4.5, tone: "lo", anchor: "middle" })}</g>`);
  return `<g data-wagon="${id}" data-bed="${bed}">${g.join("")}</g>`;
}

function gantry() {
  const out = [];
  for (const y of [OLD_Y, NEW_Y]) {
    out.push(S(k.cylinder(GANTRY_X, y, 3.4, 0, GANTRY_H, P, 20), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(GANTRY_X, y, 5, 0, 2.2, P, 20), { tone: "mid" }));
    for (const [dx, dy] of [[-6, -7], [6, -7], [-6, 7], [6, 7]])
      out.push(S(k.cylinder(GANTRY_X + dx, y + dy, 1.2, 0, 1.6, P, 12), { tone: "lo" }));
  }
  out.push(S(k.slabOf({ x: GANTRY_X - 3.4, y: OLD_Y, w: 6.8, d: NEW_Y - OLD_Y + 7, r: 2 }, GANTRY_H, 4.4, P, 3, 0.4), { tone: "mid" }));
  out.push(`<g data-trolley></g>`);
  out.push(`<g data-hook></g>`);
  return out.join("");
}

function clutter() {
  const out = [];
  // control desk with the rebase lever
  const desk = { x: 84, y: -74, w: 58, d: 24, r: 3 };
  out.push(S(k.slabOf(desk, 0, 3.4, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(desk, 1.6), 3.4, P), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([desk.x + desk.w / 2, desk.y + 5], 3.5, P, "x"), "rebase", { size: 3.4, tone: "faint", anchor: "middle" }));
  out.push(`<g data-lever></g>`);
  // ballast bins and a spare sleeper stack
  out.push(S(k.slabOf({ x: -142, y: -74, w: 40, d: 16, r: 2 }, 0, 9, P, 4, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan({ x: -142, y: -74, w: 40, d: 16, r: 2 }, 1.6), 9, P, 3), { tone: "faint" }));
  for (let i = 0; i < 3; i++)
    out.push(S(k.slabOf({ x: 96, y: 46 + i * 5, w: 44, d: 4, r: 1 }, i * 4.2, 3.4, P, 3, 0.3), { tone: "lo" }));
  return out.join("");
}

function wagons() {
  const out = [];
  // ghost footprints on the old bed, filled in only after a rebase
  for (const id of BRANCH) out.push(`<g data-ghost="${id}" display="none"></g>`);
  for (const id of SHARED) out.push(wagon(id, "old", false));
  for (const id of SHARED) out.push(wagon(id, "new", false));
  for (const id of BRANCH) out.push(wagon(id, "old", false));
  for (const id of BRANCH) out.push(wagon(id, "new", false));
  return `<g data-depth>${out.join("")}</g>`;
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A permanent-way gantry over two rail beds. The branch wagons sit on the low old bed; a gantry lifts them one at a time and sets them on the raised new bed, where they arrive with new names.",
  body: [plate(), trestle(), oldBed(), newBed(), wagons(), gantry(), clutter()],
});

const live = `
const P = ${JSON.stringify(P)};
const POS = ${JSON.stringify(POS)};
const SHARED = ${JSON.stringify(SHARED)};
const BRANCH = ${JSON.stringify(BRANCH)};
const NEW_IDS = ${JSON.stringify({ D: "D'", E: "E'" })};
const OLD_Y = ${OLD_Y};
const NEW_Y = ${NEW_Y};
const NEW_Z = ${NEW_Z};
const GANTRY_X = ${GANTRY_X};
const GANTRY_H = ${GANTRY_H};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const trolley = svg.querySelector("[data-trolley]");
const hookG = svg.querySelector("[data-hook]");
const leverG = svg.querySelector("[data-lever]");
const layer = svg.querySelector("[data-depth]");

const wagonEls = {};
for (const id of SHARED.concat(BRANCH)) {
  wagonEls[id] = {};
  for (const bed of ["old", "new"]) {
    const root = layer.querySelector('[data-wagon="' + id + '"][data-bed="' + bed + '"]');
    wagonEls[id][bed] = { root, body: root.querySelector(".wg-body"), label: root.querySelector("[data-label] text") };
  }
}

// rebased: true once the branch wagons have been replayed onto the new bed
let rebased = false, moving = null, t = 0, frame = 0, last = 0, visible = false, leverShown = "";
const moved = new Set();
const queue = [];

function paint() {
  for (const id of SHARED) {
    // shared history exists on both beds and never moves
    wagonEls[id].old.root.setAttribute("display", "inline");
    wagonEls[id].new.root.setAttribute("display", "inline");
  }
  for (const id of BRANCH) {
    if (id === moving) {
      // in flight: it has left the old bed but has not settled on the new one
      wagonEls[id].old.root.setAttribute("display", "none");
      wagonEls[id].new.root.setAttribute("display", "inline");
      wagonEls[id].new.label.textContent = NEW_IDS[id];
      wagonEls[id].new.body.setAttribute("data-lit", "");
      wagonEls[id].new.label.setAttribute("data-tone", "hi");
      setGhost(id, false);
      continue;
    }
    if (moved.has(id)) {
      // done: it now lives on the new bed, and a ghost marks where it was
      wagonEls[id].old.root.setAttribute("display", "none");
      wagonEls[id].new.root.setAttribute("display", "inline");
      wagonEls[id].new.label.textContent = NEW_IDS[id];
      wagonEls[id].new.label.setAttribute("data-tone", "lo");
      wagonEls[id].new.body.removeAttribute("data-lit");
      setGhost(id, true);
    } else {
      wagonEls[id].old.root.setAttribute("display", "inline");
      wagonEls[id].new.root.setAttribute("display", "none");
      setGhost(id, false);
    }
  }
}

// After the move, a dashed footprint stays on the old bed showing where that
// wagon used to sit -- the visual "it was here, now it lives over there".
function setGhost(id, on) {
  const g = svg.querySelector('[data-ghost="' + id + '"]');
  if (!g) return;
  if (on && !g.childElementCount) {
    const x = POS[id], y = OLD_Y;
    g.innerHTML = [
      lineSvg(planOutline(insetPlan({ x: x - 9, y: y - 5, w: 18, d: 10, r: 1.5 }, 1.8), 0.2, P, 3), { tone: "faint", dashed: true }),
      dotsSvg([iso([x - 9, y - 5, 0.2], P), iso([x + 9, y + 5, 0.2], P)], { size: 0.4, tone: "faint" }),
    ].join("");
  }
  g.setAttribute("display", on ? "inline" : "none");
}

function trolleySvg() {
  const out = [];
  out.push(solidSvg(slabOf({ x: GANTRY_X - 7, y: -5.5, w: 14, d: 11, r: 2 }, 0, 4.4, P, 3, 0.4), { tone: "mid" }));
  out.push(solidSvg(cylinder(GANTRY_X, 0, 1.6, 4.4, 3.6, P, 14), { tone: "hi", crease: "none" }));
  out.push(solidSvg(cylinder(GANTRY_X, 0, 3, 8, 2.8, P, 18), { tone: "mid" }));
  return out.join("");
}
function ropeSvg(len) {
  if (len < 0.5) return "";
  return lineSvg(rise([GANTRY_X, 0], GANTRY_H + 8, GANTRY_H + 8 - len, P), { tone: "lo" });
}
function leverSvg(throwT) {
  const out = [];
  const lean = -0.5 + throwT * 1.0;
  const len = 16, segs = 8;
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs;
    const y0 = lean * len * t0, z0 = 3.4 + len * t0 * Math.cos(lean);
    const y1 = lean * len * t1, z1 = 3.4 + len * t1 * Math.cos(lean);
    out.push(solidSvg(cylinder(113, (y0 + y1) / 2 - 68, 1.7, z0, z1 - z0 + 0.25, P, 12), { tone: "hi", crease: "none" }));
  }
  const hy = lean * len - 68, hz = 3.4 + len * Math.cos(lean);
  out.push(solidSvg(cylinder(113, hy, 3, hz, 3, P, 18), { tone: "hi" }));
  out.push(dotsSvg([iso([113, hy, hz + 3.4], P)], { size: 0.55, tone: "hi" }));
  return out.join("");
}

function setText(text) {
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function describe() {
  if (moving) return "moving " + moving + " onto the new base as " + NEW_IDS[moving];
if (rebased) return "rebased · D' and E' on B · no merge commit";
return "before · D and E sit on A";
}

function start() {
  if (rebased || moving) return;
  moving = BRANCH[0];
  t = 0;
  paint();
  run();
}

const MOVE = 1.8;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const leverTarget = moving || rebased ? 1 : 0;
  if (leverShown !== String(leverTarget)) { leverShown = String(leverTarget); leverG.innerHTML = leverSvg(leverTarget); }
  if (moving) {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    const up = Math.max(0, Math.min(1, e / 0.28));
    const across = Math.max(0, Math.min(1, (e - 0.26) / 0.44));
    const down = Math.max(0, Math.min(1, (e - 0.72) / 0.28));
    const dz = NEW_Z * up - NEW_Z * down;
    const dy = (NEW_Y - OLD_Y) * across;
    const el = wagonEls[moving].new.root;
    el.setAttribute("transform", translateAlong(P, [0, dy, dz]));
    hookG.innerHTML = ropeSvg(NEW_Z * (1 - up) + NEW_Z * down);
    if (t >= 1) {
      el.removeAttribute("transform");
      moved.add(moving);
      moving = BRANCH[BRANCH.indexOf(moving) + 1] || null;
      if (!moving) rebased = true;
      t = 0;
      hookG.innerHTML = "";
    }
    paint();
  }
  trolley.innerHTML = trolleySvg();
  trolley.setAttribute("transform", translateAlong(P, [0, moving ? (NEW_Y - OLD_Y) * 0.5 : 0, 0]));
  setText(describe());
  frame = visible && (moving || !rebased) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

svg.querySelector("[data-lever]").style.cursor = "pointer";
svg.querySelector("[data-lever]").addEventListener("click", () => start());
stage.addEventListener("keydown", (e) => { if (e.key === "r" || e.key === "R") start(); });
paint();
setText(describe());
`;

const body = navHtml("rebase", "Git rebase", "replay on a new base") + k.plateHtml({
  fig: "Fig 3",
  title: "Rebase — replay on a new base",
  hint: "Click the lever or press r to rebase",
  readout: "before",
  keys: [
    { mark: "lit", label: "The wagon being replayed right now" },
    { mark: "raised", label: "Raised bed: the new base commit" },
  ],
  caption: "Rebase does not merge. It lifts D and E off the old base and replays them on top of B, so they come back with new ids, D' and E'. Your branch is now a straight line and no merge commit is created. The same changes, new commit ids.",
  body: '<div class="iso-stage" tabindex="0" role="group" aria-label="Rebase: replay branch commits onto a new base">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git rebase", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "rebase-light.html" : "rebase.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);