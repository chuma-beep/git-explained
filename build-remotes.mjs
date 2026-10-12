// Fig 2 -- remotes. A goods yard with two loading bays.
//
// The idea: a remote is not a magic cloud, it is another copy of the same
// wagons somewhere else. `push` lifts wagons up the gantry from your bay to the
// remote bay. `fetch` only downloads what the remote has. `pull` is fetch plus
// putting it on your road -- that is the part beginners conflate.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 620;
const HEIGHT = 400;

const PLATE = { x: -150, y: -80, w: 300, d: 160, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// Your bay (left) and the remote bay (right), both on their own rails.
const LOCAL_Y = -6;
const REMOTE_Y = 46;

// Commits as wagons. The two bays have diverged from B: you have C, the remote
// has D (someone else pushed it). That divergence is what makes both push and
// pull meaningful, so the tour can show one of each.
const COMMITS = ["A", "B", "C", "D"];
const POS = { A: -108, B: -64, C: -20, D: 24 };
const LOCAL_HAS = ["A", "B", "C"];
const REMOTE_HAS = ["A", "B", "D"];

const GANTRY_X = 4;
const GANTRY_H = 62;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [POS.D + 20, REMOTE_Y, 20], [POS.A - 20, LOCAL_Y, 20]],
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
  // engraved bay names
  for (const [label, y] of [["local", LOCAL_Y + 16], ["origin", REMOTE_Y + 16]])
    out.push(k.faceTextSvg(k.topMatrix([-138, y], 0.1, P, "x"), label, { size: 5, tone: "faint" }));
  // ruler strip along the front edge
  const strip = { x: -128, y: PLATE.y + PLATE.d - 15, w: 256, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  return out.join("");
}

function track(y, x0, x1) {
  const out = [];
  out.push(S(k.slabOf({ x: x0 - 8, y: y - 11, w: x1 - x0 + 16, d: 18, r: 3 }, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  for (let x = x0; x <= x1; x += 16) out.push(S(k.slabOf({ x, y: y - 7, w: 7, d: 14, r: 1 }, 0.7, 1.6, P, 2, 0.3), { tone: "mid" }));
  for (const off of [-3.4, 3.4])
    out.push(S(k.slabOf({ x: x0, y: y + off, w: x1 - x0, d: 1.8, r: 0.8 }, 2.3, 1.8, P, 2, 0.3), { tone: "mid" }));
  for (const x of [x0, x1]) {
    out.push(S(k.slabOf({ x, y: y - 7, w: 5, d: 14, r: 1.2 }, 0, 8, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 2.5, y - 4, 8]), at([x + 2.5, y + 4, 8])], { size: 0.45 }));
  }
  return out.join("");
}

// One wagon element per (commit, bay) pair. A commit that exists in both bays
// is drawn twice -- that duplication IS the point of the figure.
function wagon(id, bay, lit) {
  const x = POS[id];
  const y = bay === "remote" ? REMOTE_Y : LOCAL_Y;
  const g = [];
  g.push(S(k.slabOf({ x: x - 11, y: y - 6, w: 22, d: 12, r: 2 }, 4.1, 2.2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 9, y: y - 5, w: 18, d: 10, r: 1.5 };
  g.push(S(k.slabOf(box, 6.3, 8, P, 3, 0.5), { tone: "hi", className: "wg-body", lit, crease: lit ? "none" : "lo" }));
  g.push(L(k.planOutline(k.insetPlan(box, 1.8), 14.3, P, 3), { tone: "faint" }));
  g.push(L(k.planOutline(k.insetPlan(box, 3.4), 14.4, P, 3), { tone: "lo" }));
  // ribs and a cant rail so the body is not a bare box
  for (const dx of [-4.4, 0, 4.4]) {
    g.push(L(k.lineOnTop([x + dx, y - 5], [x + dx, y - 5], 6.6, P), { tone: "faint" }));
    g.push(L(k.lineOnTop([x + dx, y + 5], [x + dx, y + 5], 6.6, P), { tone: "faint" }));
  }
  g.push(S(k.slabOf({ x: x + 3, y: y - 2.4, w: 5, d: 4.8, r: 0.8 }, 14.3, 0.9, P, 3, 0.3), { tone: "lo" }));
  for (const dx of [-11, 11])
    g.push(S(k.slabOf({ x: x + dx - 1, y: y - 6, w: 2, d: 12, r: 0.6 }, 3.6, 3.2, P, 2, 0.3), { tone: "mid" }));
  g.push(D([-6, -2, 2, 6].map((dx) => at([x + dx, y + 5.2, 10])), { size: 0.35 }));
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]]) {
    g.push(S(k.cylinder(x + dx, y + dy, 2.2, 1.2, 2.4, P, 16), { tone: "mid" }));
    g.push(L(k.ring(x + dx, y + dy, 2.2, 3.6, P, 16), { tone: "faint" }));
  }
  g.push(`<g data-label>${k.faceTextSvg(k.topMatrix([x, y], 14.3, P, "x"), id, { size: 4.5, tone: "lo", anchor: "middle" })}</g>`);
  return `<g data-wagon="${id}" data-bay="${bay}">${g.join("")}</g>`;
}

function gantry() {
  const out = [];
  // two legs, one over each bay, joined by a beam: the transfer crane
  for (const y of [LOCAL_Y, REMOTE_Y]) {
    out.push(S(k.cylinder(GANTRY_X, y, 3.2, 0, GANTRY_H, P, 20), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(GANTRY_X, y, 4.6, 0, 2, P, 20), { tone: "mid" }));
    // gusset plates where the leg meets its base
    out.push(S(k.slabOf({ x: GANTRY_X - 6, y: y - 6, w: 12, d: 12, r: 2 }, 0, 1.4, P, 4, 0.3), { tone: "mid" }));
    out.push(L(k.ring(GANTRY_X, y, 3.2, 4, P, 20), { tone: "faint" }));
    out.push(L(k.sideArc(GANTRY_X, y, 3.2, 18, P, 12), { tone: "faint" }));
    for (const [dx, dy] of [[-5, -6], [5, -6], [-5, 6], [5, 6]]) {
      out.push(S(k.cylinder(GANTRY_X + dx, y + dy, 1.1, 0, 1.6, P, 12), { tone: "lo" }));
      out.push(D([at([GANTRY_X + dx, y + dy, 1.7])], { size: 0.4 }));
    }
  }
  // beam spanning the two legs, with a rail on top for the trolley to run
  out.push(S(k.slabOf({ x: GANTRY_X - 3.2, y: LOCAL_Y, w: 6.4, d: REMOTE_Y - LOCAL_Y + 6.4, r: 2 }, GANTRY_H, 4, P, 3, 0.4), { tone: "mid" }));
  for (const side of [-2.4, 2.4])
    out.push(S(k.slabOf({ x: GANTRY_X + side - 0.7, y: LOCAL_Y, w: 1.4, d: REMOTE_Y - LOCAL_Y + 6.4, r: 0.5 }, GANTRY_H + 4, 1, P, 2, 0.2), { tone: "lo" }));
  // cross bracing between the legs, with a rivet dot at each end so both ends
// resolve onto the leg outline rather than floating past it
  for (const h of [18, 40]) {
    out.push(L(k.lineOnTop([GANTRY_X, LOCAL_Y], [GANTRY_X, REMOTE_Y], h, P), { tone: "faint" }));
    out.push(D([at([GANTRY_X, LOCAL_Y, h]), at([GANTRY_X, REMOTE_Y, h])], { size: 0.45 }));
  }
  // trolley rides the beam; rebuilt per frame
  out.push(`<g data-trolley></g>`);
  // hoist rope and hook hang from the trolley
  out.push(`<g data-hook></g>`);
  return out.join("");
}

function clutter() {
  const out = [];
  // control desk with a push and a pull button
  const desk = { x: -136, y: -70, w: 62, d: 22, r: 3 };
  out.push(S(k.slabOf(desk, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(desk, 1.6), 3, P), { tone: "lo" }));
  for (const [name, dx] of [["push", 18], ["pull", 44]]) {
    const [hx, hy] = at([desk.x + dx, desk.y + 11, 3]);
    // the visible button is small at phone scale, so a wide invisible disc
    // takes the tap. The two discs touch but do not overlap.
    out.push(`<g data-btn="${name}">${S(k.cylinder(desk.x + dx, desk.y + 11, 5.4, 3, 2.6, P, 24), { tone: "hi", lit: true, className: "btn" })}<circle class="iso-hit" cx="${hx}" cy="${hy}" r="13" pointer-events="all"/></g>`);
    out.push(k.faceTextSvg(k.topMatrix([desk.x + dx, desk.y + 3], 3.2, P, "x"), name, { size: 3.2, tone: "faint", anchor: "middle" }));
  }
  // oil can and a crate for texture
  out.push(S(k.cylinder(122, -58, 4.4, 0, 2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(122, -58, 3.2, 2, 7, P, 18), { tone: "mid" }));
  out.push(S(k.cylinder(122, -58, 1, 9, 5, P, 12), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(122, -58, 3.2, 6, P, 12), { tone: "faint" }));
  // crate of manifests with a banded lid
  const crate = { x: 56, y: 60, w: 26, d: 16, r: 2 };
  out.push(S(k.slabOf(crate, 0, 13, P, 4, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(crate, 1.6), 13, P, 3), { tone: "faint" }));
  out.push(S(k.slabOf({ x: crate.x + 1.6, y: crate.y + 1.6, w: crate.w - 3.2, d: crate.d - 3.2, r: 1.2 }, 13, 1.8, P, 4, 0.4), { tone: "lo", crease: "none" }));
  for (const [dx, dy] of [[2.6, 2.6], [crate.w - 2.6, 2.6], [2.6, crate.d - 2.6], [crate.w - 2.6, crate.d - 2.6]])
    out.push(D([at([crate.x + dx, crate.y + dy, 15])], { size: 0.4 }));
  // spare sleepers stacked by the gantry foot
  for (let i = 0; i < 4; i++)
    out.push(S(k.slabOf({ x: -40, y: 58 + (i % 2) * 5, w: 40, d: 4.4, r: 1 }, i * 4.2, 3.4, P, 3, 0.3), { tone: "lo" }));
  // an oil drum at the far corner
  out.push(S(k.cylinder(130, 62, 6, 0, 2.6, P, 24), { tone: "mid" }));
  out.push(S(k.cylinder(130, 62, 5.4, 2.6, 16, P, 24), { tone: "hi" }));
  out.push(L(k.ring(130, 62, 5.4, 7, P, 24), { tone: "lo" }));
  out.push(L(k.ring(130, 62, 5.4, 14.5, P, 24), { tone: "lo" }));
  out.push(S(k.cylinder(130, 62, 5.6, 18.6, 2, P, 24), { tone: "mid" }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A goods yard with two loading bays. Your wagons sit on the near rail, the remote's identical wagons on the far rail. A gantry trolley lifts a wagon across when you push, and lowers one back when you pull.",
  body: [plate(), track(LOCAL_Y, -120, 46), track(REMOTE_Y, -120, 46), wagons(), gantry(), clutter()],
});

function wagons() {
  const out = [];
  // far bay first so the near bay paints over it
  for (const id of COMMITS) out.push(wagon(id, "remote", false));
  for (const id of COMMITS) out.push(wagon(id, "local", false));
  return `<g data-depth>${out.join("")}</g>`;
}

const live = `
const P = ${JSON.stringify(P)};
const POS = ${JSON.stringify(POS)};
const COMMITS = ${JSON.stringify(COMMITS)};
const LOCAL_HAS = ${JSON.stringify(LOCAL_HAS)};
const REMOTE_HAS = ${JSON.stringify(REMOTE_HAS)};
const GANTRY_X = ${GANTRY_X};
const GANTRY_H = ${GANTRY_H};
const LOCAL_Y = ${LOCAL_Y};
const REMOTE_Y = ${REMOTE_Y};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const layer = svg.querySelector("[data-depth]");
const trolley = svg.querySelector("[data-trolley]");
const hookG = svg.querySelector("[data-hook]");
const wagonEls = {};
for (const id of COMMITS) {
  wagonEls[id] = {};
  for (const bay of ["local", "remote"]) {
    const root = layer.querySelector('[data-wagon="' + id + '"][data-bay="' + bay + '"]');
    wagonEls[id][bay] = {
      root,
      body: root.querySelector(".wg-body"),
      label: root.querySelector("[data-label] text"),
    };
  }
}

let local = new Set(LOCAL_HAS);
let remote = new Set(REMOTE_HAS);
let mode = "idle", carrying = null, t = 0, frame = 0, last = 0, visible = false;
// The tour pushes, then pulls, then rewinds, so both verbs are shown without a
// click. Held still under reduced motion.
let touring = !still.matches, dwell = 1.3, carryFrac = 0;

// Each bay shows only the commits it actually holds; a wagon mid-transfer is
// shown riding the gantry between the two.
function paint() {
  for (const id of COMMITS) {
    for (const bay of ["local", "remote"]) {
      const w = wagonEls[id][bay];
      if (id === carrying) { w.root.setAttribute("display", "none"); continue; }
      const has = bay === "local" ? local.has(id) : remote.has(id);
      w.root.setAttribute("display", has ? "inline" : "none");
      w.label.setAttribute("data-tone", has ? "lo" : "faint");
    }
  }
  if (carrying) {
    // the travelling wagon is the local-bay element, lifted and carried across
    const w = wagonEls[carrying].local;
    w.root.removeAttribute("display");
    w.root.setAttribute("opacity", "1");
    w.body.setAttribute("data-lit", "");
    w.label.setAttribute("data-tone", "hi");
  }
}
const CARRIED_Y = (REMOTE_Y - LOCAL_Y);

function carryTransform(dz, dy) {
  return translateAlong(P, [0, dy, dz]);
}

function trolleySvg() {
  const out = [];
  out.push(solidSvg(slabOf({ x: GANTRY_X - 7, y: -5.5, w: 14, d: 11, r: 2 }, 0, 4.4, P, 3, 0.4), { tone: "mid" }));
  out.push(solidSvg(cylinder(GANTRY_X, 0, 1.6, 4.4, 3.6, P, 14), { tone: "hi", crease: "none" }));
  out.push(solidSvg(cylinder(GANTRY_X, 0, 3, 8, 2.8, P, 18), { tone: "mid" }));
  out.push(dotsSvg([iso([GANTRY_X, 0, 11.4], P)], { size: 0.9, tone: "hi" }));
  return out.join("");
}
function ropeSvg(len) {
  if (len < 0.5) return "";
  const top = GANTRY_H + 8;
  return lineSvg(rise([GANTRY_X, 0], top, top - len, P), { tone: "lo" });
}

function setText(text) {
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function describe() {
  if (mode === "push") return "push · lifting " + carrying + " to origin";
  if (mode === "fetch") return "fetch · downloading " + carrying + ", not merging";
  if (mode === "pull") return "pull · " + carrying + " down onto local";
  const ahead = [...local].filter((c) => !remote.has(c));
  const behind = [...remote].filter((c) => !local.has(c));
  if (ahead.length && behind.length) return "diverged · origin lacks " + ahead.join(",") + ", you lack " + behind.join(",");
  if (ahead.length) return "local ahead by " + ahead.join(",") + " · push sends them";
  if (behind.length) return "origin ahead by " + behind.join(",") + " · pull brings them";
  return "in sync · local = origin";
}

function start(which) {
  if (mode !== "idle") return;
  if (which === "push") {
    const next = [...local].filter((c) => !remote.has(c)).sort((a, b) => POS[b] - POS[a])[0];
    if (!next) { flash("nothing to push — origin has everything"); return; }
    carrying = next; mode = "push";
  } else {
    const next = [...remote].filter((c) => !local.has(c)).sort((a, b) => POS[a] - POS[b])[0];
    if (!next) { flash("nothing to pull — you have everything"); return; }
    carrying = next; mode = which === "pull" ? "pull" : "fetch";
  }
  if (still.matches) {
    // no motion: land the result at once
    if (mode === "push") remote.add(carrying); else local.add(carrying);
    carrying = null; mode = "idle"; t = 0; carryFrac = 0; paint(); return;
  }
  t = 0;
  paint();
  run();
}
// Wind back to the diverged state so the tour can run both verbs again.
function reset() {
  local = new Set(LOCAL_HAS);
  remote = new Set(REMOTE_HAS);
  mode = "idle"; carrying = null; t = 0; carryFrac = 0;
  for (const id of COMMITS) wagonEls[id].local.root.removeAttribute("transform");
  hookG.innerHTML = "";
  paint();
}
// A reader's own action takes over; the tour resumes a few seconds later.
function poke(which) {
  touring = false;
  clearTimeout(poke.t);
  if (mode === "idle") start(which);
  poke.t = setTimeout(() => { touring = !still.matches; dwell = 1.8; run(); }, 4200);
}
function flash(msg) {
  setText(msg);
  clearTimeout(flash.t);
  flash.t = setTimeout(() => setText(describe()), 1600);
}

const MOVE = 2.1;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (mode !== "idle") {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    if (mode === "push") {
      const up = clamp01(e / 0.3);
      const across = clamp01((e - 0.28) / 0.42);
      const down = clamp01((e - 0.7) / 0.3);
      const dz = 30 * up - 30 * down;
      wagonEls[carrying].local.root.setAttribute("transform", carryTransform(dz, CARRIED_Y * across));
      carryFrac = across;
      hookG.innerHTML = ropeSvg(GANTRY_H - 30 * up + 30 * down);
      if (t >= 1) { remote.add(carrying); carrying = null; mode = "idle"; t = 0; carryFrac = 0; hookG.innerHTML = ""; }
    } else {
      const across = clamp01(e / 0.42);
      const down = clamp01((e - 0.42) / 0.32);
      const settle = clamp01((e - 0.76) / 0.24);
      const dz = -30 * across + 30 * down - 30 * settle;
      wagonEls[carrying].local.root.setAttribute("transform", carryTransform(dz, CARRIED_Y * (1 - across)));
      carryFrac = 1 - across;
      hookG.innerHTML = ropeSvg(GANTRY_H - 30 * (1 - across) + 30 * down - 30 * settle);
      if (t >= 1) { local.add(carrying); carrying = null; mode = "idle"; t = 0; carryFrac = 0; hookG.innerHTML = ""; }
    }
    // pull copies too: the remote keeps its wagon, you gain one
    paint();
  } else if (touring) {
    dwell -= dt;
    if (dwell <= 0) {
      const ahead = [...local].some((c) => !remote.has(c));
      const behind = [...remote].some((c) => !local.has(c));
      if (ahead) start("push");
      else if (behind) start("pull");
      else reset();
      dwell = 2.0;
    }
  }
  const busy = mode !== "idle";
  trolley.innerHTML = trolleySvg();
  // the trolley rides the beam above the wagon it is carrying
  trolley.setAttribute("transform", translateAlong(P, [0, CARRIED_Y * carryFrac, 0]));
  // the desk buttons press themselves while their action runs
  for (const name of ["push", "pull"]) {
    const el = svg.querySelector('[data-btn="' + name + '"]');
    const active = (name === "push" && mode === "push") || (name === "pull" && (mode === "pull" || mode === "fetch"));
    el.setAttribute("transform", translateAlong(P, [0, 0, active ? -0.8 : 0]));
  }
  setText(describe());
  frame = visible && (busy || touring) ? requestAnimationFrame(tick) : 0;
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

for (const name of ["push", "pull"]) {
  const el = svg.querySelector('[data-btn="' + name + '"]');
  el.addEventListener("click", (e) => { e.stopPropagation(); poke(name); });
  el.style.cursor = "pointer";
}
stage.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") poke("push");
  if (e.key === "l" || e.key === "L") poke("pull");
  if (e.key === "f" || e.key === "F") poke("fetch");
});
paint();
setText(describe());
`;

const body = navHtml("remotes", "Git remotes", "push &amp; pull") + k.plateHtml({
  fig: "Fig 3",
  title: "Remotes — push & pull",
  hint: "Click the desk buttons · keys p / l / f",
  readout: "in sync",
  keys: [
    { mark: "lit", label: "Wagon present in that bay" },
    { mark: "raised", label: "Gantry trolley carries a wagon between the bays" },
    { mark: "line", label: "Near bay: your copy · far bay: origin's copy" },
    { mark: "line", label: "Desk: push and pull buttons (keys p and l)" },
  ],
  caption: "A remote (origin) is just another copy of your wagons. push sends the ones it does not have; fetch downloads without merging; pull is fetch plus putting them on your road. Press p to push the commit origin is missing, or l to pull one back.",
  body: '<div class="iso-stage" tabindex="0" data-touch-hint="Tap the desk buttons to push and pull" role="group" aria-label="Git remotes: push and pull between local and origin">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git remotes", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "remotes-light.html" : "remotes.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);