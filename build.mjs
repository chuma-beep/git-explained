import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 600;
const HEIGHT = 380;

const PLATE = { x: -140, y: -70, w: 280, d: 140, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const MAIN_Y = -10;   // centre of main line
const SIDE_Y = 30;    // centre of siding
const RAIL_X0 = -120;
const RAIL_X1 = 95;
// The siding leaves main exactly at B, so "feat branches off B" is what you see.
const SIDE_X0 = -70;
const SIDE_X1 = 22;

// Commits: wagons. main runs A-B-C-F; feat branches off B as D-E; F merges C+E.
const COMMITS = [
  { id: "A", x: -108, y: MAIN_Y, br: "main" },
  { id: "B", x: -70, y: MAIN_Y, br: "main" },
  { id: "C", x: -14, y: MAIN_Y, br: "main" },
  { id: "D", x: -34, y: SIDE_Y, br: "feat" },
  { id: "E", x: 8, y: SIDE_Y, br: "feat" },
  { id: "F", x: 52, y: MAIN_Y, br: "main", merge: true },
];
// Tour order walks real history: along main to B, out along feat, back over
// the frog onto main, then on to the merge. Every step is a real git move.
const ORDER = ["A", "B", "D", "E", "C", "F"];
// Branch pointers: main is at F, feat is at E.
const POINTERS = { main: "F", feat: "E" };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-120, SIDE_Y, 20], [95, MAIN_Y, 20]],
  WIDTH, HEIGHT, { pad: 18, azimuth: 57 },
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
  const strip = { x: -118, y: PLATE.y + PLATE.d - 15, w: 236, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // label plate
  const lp = { x: -128, y: PLATE.y + 8, w: 64, d: 12, r: 1.5 };
  out.push(S(k.slabOf(lp, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.6), 0.8, P), { tone: "faint" }));
  for (let i = 0; i < 3; i++)
    out.push(L(k.lineOnTop([lp.x + 6, lp.y + 3 + i * 2.6], [lp.x + 6 + (i === 1 ? 44 : 34), lp.y + 3 + i * 2.6], 0.8, P), { tone: "lo", free: true }));
  return out.join("");
}

function track() {
  const out = [];
  // ballast inlay
  out.push(S(k.slabOf({ x: RAIL_X0 - 8, y: -22, w: RAIL_X1 - RAIL_X0 + 16, d: 18, r: 3 }, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: SIDE_X0 - 8, y: SIDE_Y - 10, w: SIDE_X1 - SIDE_X0 + 16, d: 18, r: 3 }, 0, 0.7, P, 3), { tone: "lo", crease: "none", className: "tint-blue" }));
  // sleepers
  for (let x = -116; x <= 88; x += 16) {
    out.push(S(k.slabOf({ x, y: -20, w: 7, d: 14, r: 1 }, 0.7, 1.6, P, 2, 0.3), { tone: "mid" }));
  }
  for (let x = -68; x <= 18; x += 14) {
    out.push(S(k.slabOf({ x, y: SIDE_Y - 9, w: 7, d: 14, r: 1 }, 0.7, 1.6, P, 2, 0.3), { tone: "mid" }));
  }
  // rails: pairs
  for (const y of [MAIN_Y - 3.4, MAIN_Y + 3.4])
    out.push(S(k.slabOf({ x: RAIL_X0, y, w: RAIL_X1 - RAIL_X0, d: 1.8, r: 0.8 }, 2.3, 1.8, P, 2, 0.3), { tone: "mid" }));
  for (const y of [SIDE_Y - 3.4, SIDE_Y + 3.4])
    out.push(S(k.slabOf({ x: SIDE_X0, y, w: SIDE_X1 - SIDE_X0, d: 1.8, r: 0.8 }, 2.3, 1.8, P, 2, 0.3), { tone: "mid", className: "tint-blue" }));
  // turnout blades at west junction — the pair slides sideways to set the route
  out.push(`<g data-blade>${S(k.slabOf({ x: SIDE_X0 - 2, y: -6, w: 14, d: 2.2, r: 1 }, 2.3, 1.4, P, 2), { tone: "hi" })}</g>`);
  // merge lead: two rails joining siding to main (E -> F)
  for (const off of [-1.6, 1.6]) {
    out.push(L(k.lineOnTop([12 + off, SIDE_Y - 3.4 + off * 0.4], [42 + off, MAIN_Y + 3.4 + off * 0.4], 3.9, P), { tone: "mid" }));
  }
  // sleepers along the lead — short bars with terminal dots so ends resolve
  for (let s = 0; s <= 4; s++) {
    const x = 14 + s * 7, y = SIDE_Y - s * 8;
    const a = [x - 4, y - 4], b = [x + 4, y + 4];
    out.push(L(k.lineOnTop(a, b, 2.6, P), { tone: "lo" }));
    out.push(D([at([a[0], a[1], 2.6]), at([b[0], b[1], 2.6])], { size: 0.4 }));
  }
  // frog V where lead meets main
  out.push(S(k.slabOf({ x: 34, y: -4, w: 12, d: 2.2, r: 1 }, 2.3, 1.4, P, 2), { tone: "hi" }));
  // end stops
  for (const [x, y] of [[RAIL_X1, MAIN_Y], [SIDE_X1, SIDE_Y]]) {
    out.push(S(k.slabOf({ x, y: y - 7, w: 5, d: 14, r: 1.2 }, 0, 8, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 2.5, y - 4, 8]), at([x + 2.5, y + 4, 8])], { size: 0.45 }));
  }
  return out.join("");
}

function wagon(c, lit) {
  const g = [];
  const frame = { x: c.x - 11, y: c.y - 6, w: 22, d: 12, r: 2 };
  g.push(S(k.slabOf(frame, 4.1, 2.2, P, 3, 0.4), { tone: "mid" }));
  // solebar under the frame, so the wagon has a visible edge all the way round
  g.push(L(k.planOutline(k.insetPlan(frame, 1.2), 6.3, P, 3), { tone: "faint" }));
  const box = { x: c.x - 9, y: c.y - 5, w: 18, d: 10, r: 1.5 };
  g.push(S(k.slabOf(box, 6.3, 8, P, 3, 0.5), { tone: "hi", className: "wg-body" + (c.merge ? " tint-green" : ""), lit, crease: lit ? "none" : "lo" }));
  // ribs down the box sides, and a cant rail along the top edge
  for (const dx of [-4.6, 0, 4.6]) {
    g.push(L(k.lineOnTop([c.x + dx, c.y - 5], [c.x + dx, c.y - 5], 6.6, P), { tone: "faint" }));
    g.push(L(k.lineOnTop([c.x + dx, c.y + 5], [c.x + dx, c.y + 5], 6.6, P), { tone: "faint" }));
  }
  g.push(L(k.planOutline(k.insetPlan(box, 1.8), 14.3, P, 3), { tone: "faint" }));
  g.push(L(k.planOutline(k.insetPlan(box, 3.2), 14.4, P, 3), { tone: "lo" }));
  g.push(L(k.sideSeam(box, 10, P, 3), { tone: "faint" }));
  // solebar ends and buffer beam
  for (const dx of [-11, 11]) {
    g.push(S(k.slabOf({ x: c.x + dx - 1, y: c.y - 6, w: 2, d: 12, r: 0.6 }, 3.6, 3.2, P, 2, 0.3), { tone: "mid" }));
  }
  g.push(D([-6, -2, 2, 6].map((dx) => at([c.x + dx, c.y + 5.2, 10])), { size: 0.35 }));
  // wheels with a tyre ring each, and an axle
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]]) {
    g.push(S(k.cylinder(c.x + dx, c.y + dy, 2.2, 1.2, 2.4, P, 16), { tone: "mid" }));
    g.push(L(k.ring(c.x + dx, c.y + dy, 2.2, 3.6, P, 16), { tone: "faint" }));
  }
  g.push(S(k.cylinder(c.x - 7, c.y, 0.5, 2.6, 1, P, 8), { tone: "lo" }));
  g.push(S(k.cylinder(c.x + 7, c.y, 0.5, 2.6, 1, P, 8), { tone: "lo" }));
  // a small vent hatch on the roof
  g.push(S(k.slabOf({ x: c.x + 3, y: c.y - 2.4, w: 5, d: 4.8, r: 0.8 }, 14.3, 0.9, P, 3, 0.3), { tone: "lo" }));
  // number plate
  g.push(`<g data-label>${k.faceTextSvg(k.topMatrix([c.x, c.y], 14.3, P, "x"), c.id, { size: 4.5, tone: lit ? "hi" : "lo", anchor: "middle" })}</g>`);
  // merge collar on F: a coupling plate with bolts on both shoulders
  if (c.merge) {
    for (const dx of [-9, 9]) {
      g.push(S(k.cylinder(c.x + dx, c.y, 2.6, 6.3, 2, P, 16), { tone: "mid" }));
      g.push(L(k.ring(c.x + dx, c.y, 2.6, 8.3, P, 16), { tone: "faint" }));
    }
    g.push(S(k.slabOf({ x: c.x - 6, y: c.y - 1.6, w: 12, d: 3.2, r: 1 }, 14.4, 1.2, P, 3, 0.3), { tone: "lo" }));
    for (const dx of [-4, 4]) g.push(D([at([c.x + dx, c.y, 15.7])], { size: 0.4 }));
  }
  return `<g data-wagon="${c.id}">${g.join("")}</g>`;
}

function gantry() {
  const out = [];
  const bx = 92;
  for (const y of [-18, 36]) {
    out.push(S(k.cylinder(bx, y, 2.6, 0, 24, P, 20), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(bx, y, 3.8, 0, 2, P, 20), { tone: "mid" }));
    out.push(L(k.sideArc(bx, y, 2.6, 14, P, 12), { tone: "faint" }));
  }
  out.push(S(k.slabOf({ x: bx - 2.6, y: -18, w: 5.2, d: 54, r: 2 }, 24, 3.4, P, 3, 0.4), { tone: "mid" }));
  // three lamps: main tip, feat tip, HEAD
  const lamps = [["main", 0], ["feat", 18], ["head", 36]];
  for (const [name, dy] of lamps) {
    const y = -12 + dy;
    out.push(S(k.cylinder(bx, y, 4.4, 27.4, 5, P, 24), { tone: "mid" }));
    out.push(L(k.knurl(bx, y, 4.4, 27.4, 32.4, 28, P), { tone: "lo" }));
    out.push(L(k.ring(bx, y, 3.1, 32.4, P, 24), { tone: "lo" }));
    out.push(`<g data-lamp="${name}">${D([at([bx, y, 32.4])], { size: 0.9 })}</g>`);
  }
  // signal wires from beam down to trackside (land on beam + ballast dots)
  for (const wy of [-8, 28]) {
    out.push(L(k.lineOnTop([bx - 1, wy], [bx - 1, wy], 4, P), { tone: "lo" }));
  }
  return out.join("");
}

// Branch-pointer board: two pointer arms on a quadrant that physically sit at
// the tip of their branch. These are main and feat as real moving parts.
function pointers() {
  const out = [];
  const base = { x: 112, y: -62, w: 24, d: 78, r: 3 };
  out.push(S(k.slabOf(base, 0, 2.6, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(base, 1.6), 2.6, P), { tone: "lo" }));
  // engraved branch names on the board
  for (const [name, dy] of [["main", 16], ["feat", 46]])
    out.push(k.faceTextSvg(k.topMatrix([base.x + base.w / 2, base.y + dy], 2.7, P, "x"), name, { size: 3.4, tone: "faint", anchor: "middle" }));
  // socket each arm pivots in
  for (const dy of [16, 46]) {
    out.push(S(k.cylinder(base.x + base.w / 2, base.y + dy, 3.2, 2.6, 1.4, P, 20), { tone: "mid" }));
    out.push(L(k.ring(base.x + base.w / 2, base.y + dy, 3.2, 2.6, P, 20), { tone: "lo" }));
  }
  // the arms themselves, drawn per frame so they can sit at the branch tip
  for (const name of ["main", "feat"])
    out.push(`<g data-pointer="${name}"></g>`);
  return out.join("");
}

function levers() {
  const out = [];
  const base = { x: -40, y: -58, w: 96, d: 14, r: 3 };
  out.push(S(k.slabOf(base, 0, 3, P, 4, 0.5), { tone: "mid" }));
  // quadrant ticks — rooted on back edge of base
  const t = k.topTicks(base.x + 30, base.x + 60, 6, 5, base.y + 0.9, 3, [2, 3.4], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // branch lever — pivot collar stays put, the arm is rebuilt per frame
  out.push(S(k.cylinder(-14, -51, 4.5, 3, 3, P, 24), { tone: "mid" }));
  out.push(L(k.ring(-14, -51, 4.5, 3, P, 24), { tone: "lo" }));
  out.push(`<g data-lever></g>`);
  // advance knob
  out.push(S(k.cylinder(28, -51, 6, 3, 4, P, 28), { tone: "mid" }));
  out.push(L(k.knurl(28, -51, 6, 3, 7, 28, P), { tone: "lo" }));
  out.push(D([at([28, -51, 7])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

function clutter() {
  const out = [];
  // oil can near west points
  out.push(S(k.cylinder(-88, -34, 4, 0, 2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(-88, -34, 2.8, 2, 6, P, 18), { tone: "mid" }));
  out.push(S(k.cylinder(-88, -34, 0.9, 8, 4, P, 12), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(-88, -34, 2.8, 5, P, 12), { tone: "faint" }));
  // wheel chocks
  for (const [cx, cy] of [[-112, -10], [64, -10]]) {
    out.push(S(k.slabOf({ x: cx, y: cy - 3, w: 5, d: 6, r: 1 }, 2.3, 3, P, 2, 0.3), { tone: "mid" }));
    out.push(D([at([cx + 2.5, cy, 5.3])], { size: 0.4 }));
  }
  // cable clips along main ballast
  for (const cx of [-40, 0, 40]) {
    out.push(S(k.slabOf({ x: cx, y: -21, w: 3, d: 3, r: 1 }, 0.7, 1.6, P, 2), { tone: "mid" }));
    out.push(D([at([cx + 1.5, cy0(-21), 2.3])], { size: 0.35 }));
  }
  return out.join("");
}

// Things that make the plate read as a bench rather than an empty slab: a
// spares rack, a stack of sleepers, and a crate of ballast.
function bench() {
  const out = [];
  // spare sleepers, stacked and banded
  for (let i = 0; i < 4; i++) {
    const y = 48 + (i % 2) * 5;
    out.push(S(k.slabOf({ x: -118, y, w: 46, d: 4.4, r: 1 }, i * 4.2, 3.4, P, 3, 0.3), { tone: "lo" }));
  }
  out.push(L(k.lineOnTop([-118, 50], [-72, 50], 13, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([-118, 55], [-72, 55], 13, P), { tone: "faint" }));
  // ballast bin: a riveted box with a heaped load
  const bin = { x: -136, y: 24, w: 34, d: 20, r: 2 };
  out.push(S(k.slabOf(bin, 0, 10, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(bin, 1.8), 10, P, 3), { tone: "faint" }));
  out.push(S(k.slabOf({ x: bin.x + 1.6, y: bin.y + 1.6, w: bin.w - 3.2, d: bin.d - 3.2, r: 1.2 }, 10, 2.2, P, 4, 0.6), { tone: "lo", crease: "none" }));
  for (const [dx, dy] of [[2.6, 2.6], [bin.w - 2.6, 2.6], [2.6, bin.d - 2.6], [bin.w - 2.6, bin.d - 2.6]])
    out.push(D([at([bin.x + dx, bin.y + dy, 12.3])], { size: 0.42 }));
  // a short ladder against the back edge
  for (const [lx, ly] of [[100, 60], [110, 60]]) {
    out.push(S(k.cylinder(lx, ly, 1.1, 0, 26, P, 10), { tone: "mid" }));
    out.push(D([at([lx, ly, 0])], { size: 0.42 }));
  }
  for (let r = 0; r < 6; r++)
    out.push(S(k.cylinder(105, 60, 0.75, 4 + r * 4, 1, P, 8), { tone: "hi" }));
  // oil drum in the back corner
  out.push(S(k.cylinder(128, -62, 6.4, 0, 3, P, 26), { tone: "mid" }));
  out.push(S(k.cylinder(128, -62, 5.8, 3, 17, P, 26), { tone: "hi" }));
  out.push(L(k.ring(128, -62, 5.8, 7.5, P, 26), { tone: "lo" }));
  out.push(L(k.ring(128, -62, 5.8, 15.5, P, 26), { tone: "lo" }));
  out.push(S(k.cylinder(128, -62, 6, 20, 2, P, 26), { tone: "mid" }));
  return out.join("");
}
const cy0 = (y) => y + 1.5;

const startHead = "F";
const wagonsSvg = COMMITS.map((c) => wagon(c, c.id === startHead)).join("");
const trolleySvg = '<g data-trolley></g>';
// lamps ride the gantry at these three heights; the page lights them per state
const LAMPS = Object.fromEntries([["main", 0], ["feat", 18], ["head", 36]].map(([name, dy]) => [name, [92, -12 + dy, 32.4]]));
const WEST_X = SIDE_X0;

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A signal-box switchyard for git. Wagons A to F are commits on two tracks, main and feat siding. The west points diverge the line (branch) and the east frog rejoins it (merge F with two parents C and E). Lamps show the branch tips and HEAD.",
  body: [plate(), bench(), track(), `<g data-depth>${wagonsSvg}${trolleySvg}</g>`, gantry(), pointers(), levers(), clutter()],
});

const live = `
const P = ${JSON.stringify(P)};
const COMMITS = ${JSON.stringify(COMMITS)};
const ORDER = ${JSON.stringify(ORDER)};
const POINTERS = ${JSON.stringify(POINTERS)};
const LAMPS = ${JSON.stringify(LAMPS)};
const MAIN_Y = ${MAIN_Y};
const SIDE_Y = ${SIDE_Y};
const WEST_X = ${WEST_X};
const LEAD_SIDE = [12, SIDE_Y];
const LEAD_MAIN = [42, MAIN_Y];
const DWELL = 1.5;
const SPEED = 30;
const STandoff = 13;

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const byId = Object.fromEntries(COMMITS.map((c) => [c.id, c]));
const parentOf = { A:[], B:["A"], C:["B"], D:["B"], E:["D"], F:["C","E"] };

const layer = svg.querySelector("[data-depth]");
const trolley = layer.querySelector("[data-trolley]");
const blade = svg.querySelector("[data-blade]");
const lever = svg.querySelector("[data-lever]");
const lampEls = Object.fromEntries(Object.keys(LAMPS).map((n) => [n, svg.querySelector('[data-lamp="' + n + '"]')]));
const wagonEls = Object.fromEntries(COMMITS.map((c) => [c.id, {
  root: layer.querySelector('[data-wagon="' + c.id + '"]'),
  body: layer.querySelector('[data-wagon="' + c.id + '"] .wg-body'),
  label: layer.querySelector('[data-wagon="' + c.id + '"] [data-label] text'),
}]));

function trolleySvg() {
  const out = [];
  out.push(solidSvg(slabOf({ x: -5.2, y: -3.2, w: 10.4, d: 6.4, r: 1.6 }, 4.1, 1.5, P, 3, 0.4), { tone: "mid" }));
  out.push(solidSvg(slabOf({ x: -3.6, y: -2.1, w: 7.2, d: 4.2, r: 1.2 }, 5.6, 3.1, P, 3, 0.4), { tone: "hi", lit: true }));
  for (const [dx, dy] of [[-3.1, -2.3], [3.1, -2.3], [-3.1, 2.3], [3.1, 2.3]])
    out.push(solidSvg(cylinder(dx, dy, 1.4, 2.4, 1.7, P, 14), { tone: "mid" }));
  out.push(solidSvg(cylinder(0, 0, 0.65, 8.7, 4.6, P, 10), { tone: "hi", crease: "none" }));
  out.push(solidSvg(cylinder(0, 0, 2.1, 13.3, 2.4, P, 18), { tone: "mid" }));
  out.push(lineSvg(ring(0, 0, 2.1, 13.3, P, 18), { tone: "lo" }));
  out.push(dotsSvg([iso([0, 0, 16.2], P)], { size: 1.15, tone: "hi" }));
  return out.join("");
}
trolley.innerHTML = trolleySvg();

function leverSvg(tilt) {
  const px = -14, py = -51, pz = 6, len = 15, segs = 9;
  const out = [];
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs;
    const y0 = py + Math.sin(tilt) * len * t0, z0 = pz + Math.cos(tilt) * len * t0;
    const y1 = py + Math.sin(tilt) * len * t1, z1 = pz + Math.cos(tilt) * len * t1;
    out.push(solidSvg(cylinder(px, (y0 + y1) / 2, 1.85, z0, z1 - z0 + 0.25, P, 14), { tone: "hi", crease: "none" }));
  }
  const ty = py + Math.sin(tilt) * len, tz = pz + Math.cos(tilt) * len;
  out.push(solidSvg(cylinder(px, ty, 3, tz, 3.2, P, 20), { tone: "hi" }));
  out.push(lineSvg(knurl(px, ty, 3, tz, tz + 3.2, 24, P), { tone: "lo" }));
  out.push(dotsSvg([iso([px, ty, tz + 3.2], P)], { size: 0.5, tone: "hi" }));
  return out.join("");
}

function roundCorners(pts, radius) {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1], c = pts[i], n = pts[i + 1];
    const d1 = Math.hypot(c[0] - p[0], c[1] - p[1]);
    const d2 = Math.hypot(n[0] - c[0], n[1] - c[1]);
    const r = Math.min(radius, d1 / 2, d2 / 2);
    if (r < 0.6) { out.push(c); continue; }
    const a = [c[0] + (p[0] - c[0]) * r / d1, c[1] + (p[1] - c[1]) * r / d1];
    const b = [c[0] + (n[0] - c[0]) * r / d2, c[1] + (n[1] - c[1]) * r / d2];
    for (let s = 0; s <= 6; s++) {
      const t = s / 6, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// A route on the real track: same road runs straight, main->feat sets the
// west points and reverses, feat->main runs out over the east frog.
function route(aId, bId) {
  const A = byId[aId], B = byId[bId];
  if (A.br === B.br) return roundCorners([[A.x, A.y], [B.x, B.y]], 1e9);
  if (A.br === "main") return roundCorners([[A.x, MAIN_Y], [WEST_X, MAIN_Y], [WEST_X, SIDE_Y], [B.x, SIDE_Y]], 9);
  return roundCorners([[A.x, SIDE_Y], [LEAD_SIDE[0], SIDE_Y], [LEAD_MAIN[0], MAIN_Y], [B.x, MAIN_Y]], 9);
}
function measure(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return cum;
}
function atDistance(pts, cum, d) {
  const total = cum[cum.length - 1];
  const want = Math.max(0, Math.min(total, d));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < want) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const t = (want - cum[i - 1]) / seg;
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
}
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);

let head = "F", touring = !still.matches, visible = false, clock = 0, frame = 0, last = 0;
let from = "F", to = "F", legs = null, cum = null, span = 0, u = 1, running = false;
let leverShown = "", lampShown = "", ptrShown = "";

function leg(fromId, toId) {
  const pts = route(fromId, toId);
  const c = measure(pts);
  const total = c[c.length - 1];
  return { pts, cum: c, total, time: Math.max(0.6, Math.min(2.4, total / SPEED)) };
}
function goTo(id) {
  if (!byId[id] || id === to) return;
  from = head;
  to = id;
  legs = leg(from, to);
  cum = legs.cum;
  span = legs.total;
  u = 0;
  running = true;
}
function routeBranch() { return byId[to].br; }

function placeTrolley(d) {
  // stop short of the wagon so the trolley never covers the wagon it points at
  const total = cum[cum.length - 1];
  const at = atDistance(legs.pts, cum, Math.min(d, Math.max(0, total - STandoff)));
  trolley.setAttribute("transform", translateAlong(P, [at[0], at[1], 0]));
  return at;
}
function resort(at) {
  const key = depthOf([at[0], at[1], 0], P);
  const order = COMMITS.map((c) => [wagonEls[c.id].root, depthOf([c.x, c.y, 0], P)]).concat([[trolley, key - 0.4]]);
  order.sort((a, b) => a[1] - b[1]);
  const frag = document.createDocumentFragment();
  for (const [el] of order) frag.appendChild(el);
  layer.appendChild(frag);
}

// A pointer arm: a real lever standing on the board, angled at the tip commit
// of its branch. Swinging between tips is what "moving a branch pointer" means.
function pointerSvg(branch, targetId) {
  const base = { x: 112, y: -62, w: 24, d: 78 };
  const px = base.x + base.w / 2;
  const py = branch === "main" ? base.y + 16 : base.y + 46;
  const tip = byId[targetId];
  const len = 26, half = 2.1;
  // a single solid bar from the socket out to the tip: a plan quad, extruded
  const ang = Math.atan2(tip.x - px, tip.y - py);
  const dx = Math.sin(ang), dy = Math.cos(ang);
  const nx = dy, ny = -dx;                       // perpendicular in plan
  const ring = [
    [px - nx * half, py - ny * half],
    [px + dx * len - nx * 1.2, py + dy * len - ny * 1.2],
    [px + dx * len + nx * 1.2, py + dy * len + ny * 1.2],
    [px + nx * half, py + ny * half],
  ];
  const out = [];
  out.push(solidSvg(extrude(ring, 3, 2.2, P), { tone: "hi", lit: true, className: "ptr-arm" }));
  const hx = px + dx * len, hy = py + dy * len;
  out.push(solidSvg(cylinder(hx, hy, 3, 3, 2.2, P, 20), { tone: "mid" }));
  out.push(dotsSvg([iso([hx, hy, 5.6], P)], { size: 0.9, tone: "hi" }));
  return out.join("");
}

function draw() {
  const branch = routeBranch();
  const tilt = branch === "feat" ? 0.62 : -0.14;
  const lean = running ? tilt : tilt;
  if (leverShown !== lean.toFixed(3)) { leverShown = lean.toFixed(3); lever.innerHTML = leverSvg(lean); }
  blade.setAttribute("transform", translateAlong(P, [0, branch === "feat" ? 2.4 : -1.2, 0]));

  // branch pointers sit at their real tips: main -> F, feat -> E
  const ptrKey = POINTERS.main + POINTERS.feat;
  if (ptrShown !== ptrKey) {
    ptrShown = ptrKey;
    for (const name of ["main", "feat"]) {
      svg.querySelector('[data-pointer="' + name + '"]').innerHTML = pointerSvg(name, POINTERS[name]);
    }
  }

  const lampKey = [branch, running ? 1 : 0].join("/");
  if (lampShown !== lampKey) {
    lampShown = lampKey;
    lampEls.main.innerHTML = dotsSvg([iso(LAMPS.main, P)], { size: branch === "main" ? 1.3 : 0.8, tone: branch === "main" ? "amber" : "faint" });
    lampEls.feat.innerHTML = dotsSvg([iso(LAMPS.feat, P)], { size: branch === "feat" ? 1.3 : 0.8, tone: branch === "feat" ? "blue" : "faint" });
    lampEls.head.innerHTML = dotsSvg([iso(LAMPS.head, P)], { size: running ? 1.3 : 0.95, tone: running ? "green" : "faint", pulse: running });
  }

  for (const c of COMMITS) {
    const w = wagonEls[c.id];
    const on = c.id === head;
    if (on) w.body.setAttribute("data-lit", ""); else w.body.removeAttribute("data-lit");
    w.label.setAttribute("data-tone", on ? "hi" : "lo");
  }

  const info = byId[head];
  const road = running ? " · setting " + branch : "";
  const text = "HEAD→" + head + " · " + info.br + road + (running ? "" : info.merge ? " · merge F = C+E" : " · parent " + (parentOf[head].join("+") || "—"));
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(ORDER.indexOf(head)));
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  if (running) {
    u = Math.min(1, u + dt / legs.time);
    const d = ease(u) * span;
    const at = placeTrolley(d);
    resort(at);
    if (u >= 1) { head = to; running = false; clock = 0; }
  } else if (touring && clock > DWELL) {
    clock = 0;
    goTo(ORDER[(ORDER.indexOf(to) + 1) % ORDER.length]);
    if (!running) running = true;
  }
  draw();
  frame = visible && (running || touring) ? requestAnimationFrame(tick) : 0;
}

const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

function steer(id) {
  if (!byId[id]) return;
  clearTimeout(steer.t);
  if (id !== head) { goTo(id); running = true; }
  if (still.matches) { head = id; running = false; placeTrolley(0); legs = leg(id, id); cum = legs.cum; span = 0; u = 1; }
  draw();
  steer.t = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 3600);
}

// Aim HEAD from a point on the figure. On a touch screen there is no hover,
// so pointerdown also steers, and a plain tap then works.
function aimAt(e) {
  const box = svg.getBoundingClientRect();
  const share = ((e.clientX - box.left) / box.width - 0.2) / 0.6;
  const idx = Math.max(0, Math.min(ORDER.length - 1, Math.round(share * (ORDER.length - 1))));
  steer(ORDER[idx]);
}
stage.addEventListener("pointermove", aimAt);
stage.addEventListener("pointerdown", aimAt);
const typing = (e) => { const t = e.target; return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
document.addEventListener("keydown", (e) => { if (typing(e)) return;
  // Arrow keys also scroll the page, so only take them while the figure is
  // on screen. Past it, the arrows scroll as usual.
  if (!visible) return;
  const i = ORDER.indexOf(head); let to = null;
  if (e.key === "ArrowRight" || e.key === "ArrowUp") to = Math.min(ORDER.length - 1, i + 1);
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = Math.max(0, i - 1);
  if (e.key === "Home") to = 0;
  if (e.key === "End") to = ORDER.length - 1;
  if (to === null) return;
  e.preventDefault();
  steer(ORDER[to]);
});

if (still.matches) {
  head = "F"; to = "F"; running = false;
  legs = leg("F", "F"); cum = legs.cum; span = 0; u = 1;
  placeTrolley(0);
}
draw();
`;

const body = navHtml("switchyard", "Git switchyard", "commits as wagons") + k.plateHtml({
  fig: "Fig 2", title: "Branch & merge",
  hint: "Hover to move HEAD · arrows step commits",
  readout: "HEAD→F · main",
  keys: [
    { mark: "lit", label: "HEAD wagon: where you are (the trolley rides to it)" },
    { mark: "raised", label: "Wagons A–F: commits; F is a merge of C and E" },
    { mark: "line", label: "Pointer board: main sits at F, feat sits at E" },
    { mark: "line", label: "Bench: sleepers, ballast bin and oil for the yard" },
  ],
  caption: "Commits are wagons, branches are roads. main runs A-B-C-F; feat leaves the line at the west points, exactly where B stands, and runs D-E. F is a merge: it has two parents, C and E. The pointer board on the right holds main at F and feat at E.",
  body: '<div class="iso-stage" tabindex="0" data-touch-hint="Drag or tap a wagon to move HEAD" role="slider" aria-label="Git switchyard: arrow keys move HEAD" aria-valuemin="0" aria-valuemax="5" aria-valuenow="2">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git switchyard", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "git-switchyard-light.html" : "git-switchyard.html";
writeFileSync(join(HERE, name), page);
// index.html is the light build, so the folder opens somewhere sensible by default
if (theme === "light") writeFileSync(join(HERE, "index.html"), page);
console.log("wrote", name);
