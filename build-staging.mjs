// Fig 5 -- the three areas. A packing bench.
//
// The idea: a change moves through three places before it is history.
//   the bench  = the working directory, where you change things
//   the tray   = the staging area, where you choose what goes in the next commit
//   the press  = git commit, which seals the tray into a crate on the rack
// The point beginners miss: `add` chooses, `commit` freezes. A change left on
// the bench is not in the next commit, however often you save the file.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 640;
const HEIGHT = 400;

const PLATE = { x: -158, y: -88, w: 316, d: 176, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// The three stations, left to right.
const BENCH = { x: -150, y: -34, w: 76, d: 62, r: 3 };
const BENCH_TOP = 16;
const TRAY = { x: -36, y: -20, w: 74, d: 40, r: 2 };
const TRAY_TOP = 4;
const PRESS_X = -1;
const RACK = { x: 50, y: -28, w: 64, d: 60, r: 3 };
const RAIL_Z = 42;
const PH = 26;   // press height: how high the crown sits

// Four changes. The shape says what kind of change it is, so the eye can follow
// one part from the bench to the tray to a crate.
const PARTS = [
  { kind: "plate", note: "edited" },
  { kind: "rod", note: "edited" },
  { kind: "gear", note: "new" },
  { kind: "plate", note: "edited" },
];
const COMMITS = ["a1b2c3", "d4e5f6", "0718ab"];
const SLOTS = 4;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [RACK.x + RACK.w, RACK.y, RAIL_Z + 8], [BENCH.x, BENCH.y, BENCH_TOP + 24]],
  WIDTH, HEIGHT, { pad: 16, azimuth: 52 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// A change keeps a fixed place on the bench, so nothing shifts as parts leave.
const benchSpot = (i) => [BENCH.x + 20 + (i % 2) * 36, BENCH.y + 18 + Math.floor(i / 2) * 22, BENCH_TOP + 5];
const traySpot = (i) => [TRAY.x + 13 + i * 16, TRAY.y + 20, TRAY_TOP + 1.4];
// crates stack upward: history grows in one column
const rackSpot = (i) => [RACK.x + 32, RACK.y + 30, 4 + i * 15];

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
  // the three stations are engraved into the plate, so no words float in the art
  const name = (text, x, y) => k.faceTextSvg(k.topMatrix([x, y], 0.1, P, "x"), text, { size: 4.6, tone: "faint" });
  out.push(name("working directory", BENCH.x + 2, BENCH.y + BENCH.d + 9));
  out.push(name("staging area", TRAY.x + 6, TRAY.y + TRAY.d + 7));
  out.push(name("history", RACK.x + 26, RACK.y + RACK.d - 4));
  return out.join("");
}

function bench() {
  const out = [];
  out.push(S(k.slabOf(BENCH, BENCH_TOP, 5, P, 4, 0.6), { tone: "mid", className: "tint-amber" }));
  out.push(L(k.planOutline(k.insetPlan(BENCH, 2.4), BENCH_TOP + 5, P, 3), { tone: "faint" }));
  for (const [x, y] of k.corners(BENCH, 9)) {
    out.push(S(k.cylinder(x, y, 1.8, 0, BENCH_TOP, P, 14), { tone: "mid" }));
    out.push(D([at([x, y, 0])], { size: 0.45 }));
  }
  // a lower shelf and a rack of hand tools
  out.push(S(k.slabOf({ x: BENCH.x + 8, y: BENCH.y + 12, w: BENCH.w - 16, d: 18, r: 2 }, 6, 2, P, 3, 0.3), { tone: "lo" }));
  for (let i = 0; i < 3; i++)
    out.push(S(k.cylinder(BENCH.x + 18 + i * 8, BENCH.y + 21, 0.9, 8, 9, P, 10), { tone: "mid" }));
  // a vice on the bench edge
  out.push(S(k.slabOf({ x: BENCH.x + BENCH.w - 20, y: BENCH.y + 5, w: 13, d: 11, r: 1.5 }, BENCH_TOP + 5, 5, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(BENCH.x + BENCH.w - 8, BENCH.y + 10, 1.3, BENCH_TOP + 6, 9, P, 10), { tone: "hi" }));
  for (const dz of [0, 4, 8]) out.push(L(k.ring(BENCH.x + BENCH.w - 8, BENCH.y + 10, 1.3, BENCH_TOP + 6 + dz, P, 10), { tone: "lo" }));
  return out.join("");
}

function tray() {
  const out = [];
  out.push(S(k.slabOf(TRAY, 0, 1.4, P, 3, 0.3), { tone: "lo" }));
  const wall = 4;
  for (const [w, d, ox, oy] of [
    [TRAY.w, wall, 0, 0], [TRAY.w, wall, 0, TRAY.d - wall],
    [wall, TRAY.d - wall * 2, 0, wall], [wall, TRAY.d - wall * 2, TRAY.w - wall, wall],
  ]) out.push(S(k.slabOf({ x: TRAY.x + ox, y: TRAY.y + oy, w, d, r: 0.8 }, 1.4, 4, P, 3, 0.3), { tone: "mid", className: "tint-blue" }));
  for (let i = 1; i < SLOTS; i++) {
    const x = TRAY.x + 13 + i * 16 - 5;
    out.push(L(k.lineOnTop([x, TRAY.y + 6], [x, TRAY.y + TRAY.d - 6], 1.6, P), { tone: "faint" }));
  }
  return out.join("");
}

function press() {
  const out = [];
  for (const [x, y] of [[PRESS_X - 28, TRAY.y - 12], [PRESS_X + 28, TRAY.y - 12], [PRESS_X - 28, TRAY.y + TRAY.d + 8], [PRESS_X + 28, TRAY.y + TRAY.d + 8]]) {
    out.push(S(k.cylinder(x, y, 2.4, 0, PH, P, 16), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x, y, 3.8, 0, 2, P, 16), { tone: "mid" }));
    out.push(D([at([x, y, 0])], { size: 0.5 }));
  }
  out.push(S(k.slabOf({ x: PRESS_X - 30, y: TRAY.y - 14, w: 60, d: TRAY.d + 24, r: 2 }, PH, 5, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(PRESS_X, TRAY.y + 9, 4.2, PH + 5, 6, P, 18), { tone: "hi" }));
  out.push(L(k.ring(PRESS_X, TRAY.y + 9, 4.2, PH + 5, P, 18), { tone: "lo" }));
  out.push(`<g data-ram></g>`);
  return out.join("");
}

function rack() {
  const out = [];
  out.push(S(k.slabOf(RACK, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(RACK, 2), 3, P, 3), { tone: "faint" }));
  for (const [x, y] of k.corners(RACK, 8)) {
    out.push(S(k.cylinder(x, y, 1.7, 0, 3, P, 12), { tone: "lo" }));
    out.push(D([at([x, y, 0])], { size: 0.4 }));
  }
  // an open stacking frame: a base board, a back wall and two posts, so the
  // crates stay in view as the stack grows
  out.push(S(k.slabOf({ x: RACK.x, y: RACK.y, w: RACK.w, d: RACK.d, r: 1 }, 3, 2.4, P, 3, 0.3), { tone: "mid", className: "tint-green" }));
  out.push(S(k.slabOf({ x: RACK.x + RACK.w - 6, y: RACK.y, w: 6, d: RACK.d, r: 1 }, 5.4, 52, P, 3, 0.3), { tone: "mid", className: "tint-green" }));
  for (const y of [RACK.y + 3, RACK.y + RACK.d - 6]) {
    out.push(S(k.cylinder(RACK.x + 3, y + 1.5, 1.6, 5.4, 52, P, 12), { tone: "mid", crease: "none" }));
    out.push(D([at([RACK.x + 3, y + 1.5, 5.4])], { size: 0.4 }));
  }
  return out.join("");
}

// The overhead rail the picker arm hangs from, spanning bench to press.
function rail() {
  const out = [];
  const y = TRAY.y + TRAY.d / 2;
  out.push(S(k.slabOf({ x: BENCH.x, y, w: PRESS_X + 30 - BENCH.x, d: 5, r: 1.4 }, RAIL_Z, 3.4, P, 3, 0.3), { tone: "mid" }));
  for (const x of [BENCH.x + 4, PRESS_X + 26]) {
    out.push(S(k.cylinder(x, y + 2.5, 2, 0, RAIL_Z, P, 14), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x, y + 2.5, 3, 0, 2, P, 14), { tone: "mid" }));
    out.push(D([at([x, y + 2.5, 0])], { size: 0.45 }));
  }
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A packing bench. Changes sit on the bench, the working directory. A picker on an overhead rail moves them into the tote tray, the staging area. A press seals the tray into a crate that goes on the rack, the commit history.",
  body: [plate(), bench(), tray(), press(), rack(), rail(),
    `<g data-parts></g>`, `<g data-crates></g>`, `<g data-arm></g>`],
});

const live = `
const P = ${JSON.stringify(P)};
const PARTS = ${JSON.stringify(PARTS)};
const COMMITS = ${JSON.stringify(COMMITS)};
const BENCH = ${JSON.stringify(BENCH)};
const TRAY = ${JSON.stringify(TRAY)};
const RACK = ${JSON.stringify(RACK)};
const SLOTS = ${SLOTS};
const RAIL_Z = ${RAIL_Z};
const PH = ${PH};
const PRESS_X = ${PRESS_X};
const TRAY_Y = ${TRAY.y};
const BENCH_TOP = ${BENCH_TOP};
const TRAY_TOP = ${TRAY_TOP};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const partsG = svg.querySelector("[data-parts]");
const cratesG = svg.querySelector("[data-crates]");
const armG = svg.querySelector("[data-arm]");
const ramG = svg.querySelector("[data-ram]");

const benchSpot = ${benchSpot.toString()};
const traySpot = ${traySpot.toString()};
const rackSpot = ${rackSpot.toString()};

// Where each change is: "bench", "tray", or "committed".
let spot = PARTS.map(() => "bench");
const committed = [];
let mode = "idle", t = 0, carry = -1, frame = 0, last = 0, visible = false;
let touring = !still.matches, dwell = 1.5, ramZ = 0;

const LIT = (tint) => ({ tone: "hi", lit: true, crease: "none", className: "tint-" + tint });
const PLAIN = (tint) => ({ tone: "hi", crease: "lo", className: "tint-" + tint });

function changeSvg(kind, x, y, z, tint, lit) {
  const out = [];
  const body = lit ? LIT(tint) : PLAIN(tint);
  if (kind === "plate") {
    const box = { x: x - 5.5, y: y - 4, w: 11, d: 8, r: 1 };
    out.push(solidSvg(slabOf(box, z, 3.4, P, 3, 0.3), body));
    out.push(lineSvg(planOutline(insetPlan(box, 1.3), z + 3.4, P, 3), { tone: "faint" }));
  } else if (kind === "rod") {
    out.push(solidSvg(cylinder(x, y, 2.3, z, 9, P, 14), body));
    out.push(lineSvg(ring(x, y, 2.3, z + 9, P, 14), { tone: "faint" }));
    out.push(dotsSvg([iso([x, y, z + 9], P)], { size: 0.5, tone: "hi" }));
  } else {
    out.push(solidSvg(cylinder(x, y, 4.2, z, 3, P, 20), body));
    out.push(lineSvg(knurl(x, y, 4.2, z, z + 3, 16, P), { tone: "lo" }));
    out.push(solidSvg(cylinder(x, y, 2.5, z + 3, 5.4, P, 12), body));
  }
  return out.join("");
}
function crateSvg(x, y, z, id) {
  const out = [];
  const box = { x: x - 11, y: y - 8, w: 22, d: 16, r: 1.5 };
  out.push(solidSvg(slabOf(box, z, 13, P, 4, 0.4), { tone: "mid", className: "tint-green" }));
  out.push(lineSvg(planOutline(insetPlan(box, 1.8), z + 13, P, 3), { tone: "faint" }));
  for (const dy of [-4.4, 3.6]) out.push(lineSvg(lineOnTop([x - 11, y + dy], [x + 11, y + dy], z + 13.1, P), { tone: "mid" }));
  out.push(solidSvg(slabOf({ x: x - 3, y: y - 8, w: 6, d: 16, r: 0.8 }, z + 13, 1.2, P, 3, 0.2), { tone: "hi" }));
  out.push(faceTextSvg(topMatrix([x, y], z + 13.6, P, "x"), id, { size: 3.4, tone: "lo", anchor: "middle" }));
  return out.join("");
}

// Only tray parts get a slot, so they pack from the left as they arrive.
function traySlotOf(j) { let n = 0; for (let q = 0; q < j; q++) if (spot[q] === "tray") n++; return n; }
function staged() { return spot.filter((s) => s === "tray").length; }
function onBench() { return spot.filter((s) => s === "bench").length; }

function paint() {
  const bits = [];
  for (let j = 0; j < PARTS.length; j++) {
    if (spot[j] === "bench") { const b = benchSpot(j); bits.push(changeSvg(PARTS[j].kind, b[0], b[1], b[2], "amber", false)); }
    else if (spot[j] === "tray") { const s = traySpot(traySlotOf(j)); bits.push(changeSvg(PARTS[j].kind, s[0], s[1], s[2], "blue", true)); }
  }
  partsG.innerHTML = bits.join("");
  cratesG.innerHTML = committed.map((id, i) => { const r = rackSpot(i); return crateSvg(r[0], r[1], r[2], id); }).join("");
}

function setText(text) {
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function describe() {
  if (mode === "add") return "git add · moving a change to the tray";
  if (mode === "commit") return "git commit · sealing " + staged() + " change(s) into a crate";
  const s = staged(), b = onBench();
  if (s) return "bench " + b + " · staged " + s + " · commit seals the tray";
  if (b) return "bench " + b + " · nothing staged · add puts a change in the tray";
  return "clean · the tray is empty and the bench is clear";
}

function addOne() {
  if (mode !== "idle" || staged() >= SLOTS) return false;
  const i = spot.indexOf("bench");
  if (i < 0) return false;
  carry = i; mode = "add"; t = 0; run(); return true;
}
function commitTray() {
  if (mode !== "idle" || staged() === 0) return false;
  mode = "commit"; t = 0; run(); return true;
}
function reset() {
  spot = PARTS.map(() => "bench");
  committed.length = 0;
  ramZ = 0;
  paint();
}
function poke(what) {
  touring = false;
  clearTimeout(poke.t);
  if (mode === "idle") {
    if (what === "commit") commitTray();
    else if (!addOne()) commitTray();
  }
  poke.t = setTimeout(() => { touring = !still.matches; dwell = 1.9; run(); }, 4200);
}

function armAt(x, y, z) {
  return lineSvg(rise([x, y], RAIL_Z, z + 5, P), { tone: "faint" })
    + solidSvg(slabOf({ x: x - 7, y: y - 5, w: 14, d: 10, r: 1.6 }, z + 5, 5, P, 3, 0.3), { tone: "mid" });
}

const MOVE = 1.6;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (mode === "add") {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    const i = carry;
    const from = benchSpot(i), to = traySpot(staged());
    const lift = Math.sin(Math.PI * e) * 24;
    const x = from[0] + (to[0] - from[0]) * e;
    const y = from[1] + (to[1] - from[1]) * e;
    const z = from[2] + (to[2] - from[2]) * e + lift;
    const bits = [];
    for (let j = 0; j < PARTS.length; j++) {
      if (j === i) continue;
      if (spot[j] === "bench") { const b = benchSpot(j); bits.push(changeSvg(PARTS[j].kind, b[0], b[1], b[2], "amber", false)); }
      else if (spot[j] === "tray") { const s = traySpot(traySlotOf(j)); bits.push(changeSvg(PARTS[j].kind, s[0], s[1], s[2], "blue", true)); }
    }
    bits.push(changeSvg(PARTS[i].kind, x, y, z, "blue", true));
    partsG.innerHTML = bits.join("");
    armG.innerHTML = armAt(x, y, z);
    if (t >= 1) { spot[i] = "tray"; carry = -1; mode = "idle"; t = 0; armG.innerHTML = ""; paint(); }
  } else if (mode === "commit") {
    t = Math.min(1, t + dt / MOVE);
    ramZ = t < 0.5 ? (t / 0.5) * 30 : (1 - (t - 0.5) / 0.5) * 30;
    ramG.innerHTML = solidSvg(cylinder(PRESS_X, TRAY_Y + 9, 3.8, PH + 11 - ramZ, 6, P, 18), { tone: "hi", className: "tint-green", lit: true });
    if (t >= 1) {
      committed.push(COMMITS[committed.length % COMMITS.length]);
      for (let i = 0; i < spot.length; i++) if (spot[i] === "tray") spot[i] = "committed";
      ramZ = 0; ramG.innerHTML = ""; mode = "idle"; t = 0;
      paint();
    }
  } else if (touring) {
    dwell -= dt;
    if (dwell <= 0) {
      if (staged() >= 2 || onBench() === 0) { if (staged()) commitTray(); else reset(); }
      else addOne();
      dwell = 1.9;
    }
  }
  if (mode === "idle") { armG.innerHTML = ""; }
  setText(describe());
  frame = visible && (mode !== "idle" || touring) ? requestAnimationFrame(tick) : 0;
}

const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

stage.addEventListener("click", () => poke("add"));
const typing = (e) => { const t = e.target; return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
document.addEventListener("keydown", (e) => { if (typing(e)) return; if (e.key === "a" || e.key === "A") { e.preventDefault(); poke("add"); }
  if (e.key === "c" || e.key === "C") { e.preventDefault(); poke("commit"); }
});
paint();
setText(describe());
`;

const body = navHtml("staging", "Git staging", "the three areas") + k.plateHtml({
  fig: "Fig 1",
  title: "Working directory, staging area, commit",
  hint: "Click to add · a to add · c to commit",
  readout: "bench 4",
  keys: [
    { mark: "raised", label: "The bench: your working directory, where you edit" },
    { mark: "lit", label: "The tray: the staging area, what the next commit takes" },
    { mark: "line", label: "The press is git commit: it seals the tray into a crate" },
    { mark: "line", label: "The rack is history: one crate per commit" },
  ],
  caption: "A change passes through three places. You edit it on the bench, your working directory. git add moves it to the tray, the staging area, and only what is in the tray goes into the next commit. git commit seals the tray into a crate and puts it on the rack. A change left on the bench is not in the commit, however often you save the file.",
  body: '<div class="iso-stage" tabindex="0" data-touch-hint="Tap to add a change · the press commits" role="group" aria-label="The three areas: working directory, staging area and commit">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git staging area", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "staging-light.html" : "staging.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
