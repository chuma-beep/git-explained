// Fig 8 -- conflicts. Two roads into one berth.
//
// The idea: a conflict is not a git failure. It happens when two branches change
// the same lines, so git has two answers for one place and cannot choose. Git
// stops, marks the place, and waits for a person. The fix is an edit, then one
// more commit.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 640;
const HEIGHT = 400;

const PLATE = { x: -156, y: -84, w: 312, d: 168, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// Two approach roads, one throat.
const MAIN_Y = -28;
const FEAT_Y = 36;
const THROAT_Y = 4;
const APPROACH_X = -108;
const MERGE_X = -22;
const BERTH_X = 26;

const WAGONS = {
  c3: { road: MAIN_Y, id: "c3", note: "edited line 42" },
  f1: { road: FEAT_Y, id: "f1", note: "also line 42" },
};
const CRANE_X = BERTH_X;
const CRANE_H = 62;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [BERTH_X + 40, THROAT_Y, CRANE_H + 10], [APPROACH_X - 16, FEAT_Y, 20]],
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
  const strip = { x: -134, y: PLATE.y + PLATE.d - 14, w: 268, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 6, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  const name = (text, x, y) => k.faceTextSvg(k.topMatrix([x, y], 0.1, P, "x"), text, { size: 4.4, tone: "faint" });
  out.push(name("main", APPROACH_X + 6, MAIN_Y + 16));
  out.push(name("feat", APPROACH_X + 6, FEAT_Y - 18));
  out.push(name("one berth, two answers", BERTH_X - 36, THROAT_Y + 18));
  return out.join("");
}

// A road: ballast, sleepers along its length, and a pair of rails.
function road(x0, y, x1, tint) {
  const out = [];
  out.push(S(k.slabOf({ x: x0, y: y - 11, w: x1 - x0, d: 22, r: 3 }, 0, 2, P, 3, 0.4), { tone: "mid", className: "tint-" + tint }));
  for (let x = x0 + 4; x < x1 - 4; x += 16) out.push(S(k.slabOf({ x, y: y - 8, w: 6, d: 16, r: 1 }, 2, 1.4, P, 2, 0.3), { tone: "lo" }));
  for (const off of [-3.4, 3.4]) out.push(S(k.slabOf({ x: x0, y: y + off, w: x1 - x0, d: 1.6, r: 0.7 }, 3.4, 1.6, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}

function junction() {
  const out = [];
  // the two leads run into the throat and squeeze to one road
  for (const [y, off] of [[MAIN_Y, -1.6], [MAIN_Y, 1.6]])
    out.push(L(k.lineOnTop([MERGE_X - 12, y + off], [MERGE_X, THROAT_Y + off], 3.9, P), { tone: "mid" }));
  for (const [y, off] of [[FEAT_Y, -1.6], [FEAT_Y, 1.6]])
    out.push(L(k.lineOnTop([MERGE_X - 12, y + off], [MERGE_X, THROAT_Y + off], 3.9, P), { tone: "mid" }));
  for (const s of [0, 1, 2, 3]) {
    const x = MERGE_X - 10 + s * 5;
    const t = s / 3;
    const ya = MAIN_Y + (THROAT_Y - MAIN_Y) * t;
    const yb = FEAT_Y + (THROAT_Y - FEAT_Y) * t;
    // sleeper bars across each lead, each end riveted so it does not float
    for (const y of [ya, yb]) {
      out.push(L(k.lineOnTop([x - 4, y], [x + 4, y], 2.6, P), { tone: "lo" }));
      out.push(D([at([x - 4, y, 2.6]), at([x + 4, y, 2.6])], { size: 0.4 }));
    }
  }
  // a buffer stop at the throat end, so the berth reads as a place
  out.push(S(k.slabOf({ x: BERTH_X + 20, y: THROAT_Y - 9, w: 6, d: 18, r: 1.2 }, 0, 10, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([BERTH_X + 23, THROAT_Y - 5, 10]), at([BERTH_X + 23, THROAT_Y + 5, 10])], { size: 0.45 }));
  return out.join("");
}

// The conflict lamp, between the two answers.
function lamp() {
  const out = [];
  const x = BERTH_X, y = THROAT_Y;
  out.push(S(k.cylinder(x, y, 2.6, 0, 22, P, 14), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 3.6, 0, 2, P, 14), { tone: "mid" }));
  out.push(D([at([x, y, 0])], { size: 0.5 }));
  out.push(S(k.cylinder(x, y, 4.4, 22, 5, P, 22), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 4.4, 22, 27, 24, P), { tone: "lo" }));
  out.push(L(k.ring(x, y, 3.2, 27, P, 22), { tone: "lo" }));
  out.push(`<g data-lamp></g>`);
  return out.join("");
}

function crane() {
  const out = [];
  for (const [x, y] of [[CRANE_X - 24, THROAT_Y - 12], [CRANE_X + 24, THROAT_Y - 12], [CRANE_X - 24, THROAT_Y + 12], [CRANE_X + 24, THROAT_Y + 12]]) {
    out.push(S(k.cylinder(x, y, 2.4, 0, CRANE_H, P, 16), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x, y, 3.6, 0, 2, P, 16), { tone: "mid" }));
    out.push(D([at([x, y, 0])], { size: 0.5 }));
  }
  out.push(S(k.slabOf({ x: CRANE_X - 27, y: THROAT_Y - 14, w: 54, d: 28, r: 2 }, CRANE_H, 5, P, 3, 0.4), { tone: "mid" }));
  out.push(`<g data-tool></g>`);
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "Two roads run into one berth. A wagon from main and a wagon from feat both change the same line, so both claim the berth. A red lamp marks the clash until a tool rewrites one wagon and both fit.",
  body: [plate(), road(APPROACH_X, MAIN_Y, MERGE_X + 4, "amber"), road(APPROACH_X, FEAT_Y, MERGE_X + 4, "blue"), road(MERGE_X - 4, THROAT_Y, BERTH_X + 26, "green"),
    junction(), crane(), lamp(), `<g data-wagons></g>`],
});

const live = `
const P = ${JSON.stringify(P)};
const WAGONS = ${JSON.stringify(WAGONS)};
const APPROACH_X = ${APPROACH_X};
const MERGE_X = ${MERGE_X};
const BERTH_X = ${BERTH_X};
const THROAT_Y = ${THROAT_Y};
const MAIN_Y = ${MAIN_Y};
const FEAT_Y = ${FEAT_Y};
const CRANE_X = ${CRANE_X};
const CRANE_H = ${CRANE_H};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const wagonsG = svg.querySelector("[data-wagons]");
const toolG = svg.querySelector("[data-tool]");
const lampG = svg.querySelector("[data-lamp]");

const LIT = { tone: "hi", lit: true, crease: "none" };
const PLAIN = { tone: "hi", crease: "lo" };

function wagon(o, x, y, lit, marker) {
  const g = [];
  g.push(solidSvg(slabOf({ x: x - 11, y: y - 6.5, w: 22, d: 13, r: 2 }, 4.5, 2.2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 9, y: y - 5.5, w: 18, d: 11, r: 1.4 };
  g.push(solidSvg(slabOf(box, 6.7, 8, P, 3, 0.5), lit ? LIT : PLAIN));
  g.push(lineSvg(planOutline(insetPlan(box, 1.7), 14.7, P, 3), { tone: "faint" }));
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]])
    g.push(solidSvg(cylinder(x + dx, y + dy, 2.1, 2.5, 2.2, P, 14), { tone: "mid" }));
  g.push(faceTextSvg(topMatrix([x, y], 14.7, P, "x"), o.id, { size: 4, tone: "lo", anchor: "middle" }));
  // the clashing line is flagged on the roof while the conflict is open
  if (marker) {
    g.push(solidSvg(slabOf({ x: x - 7, y: y - 3.5, w: 14, d: 7, r: 1 }, 14.7, 1.6, P, 3, 0.3), { tone: "hi" }));
    g.push(dotsSvg([iso([x, y, 16.5], P)], { size: 0.9, tone: "hi" }));
  }
  return g.join("");
}

// phase: "apart" -> "clash" -> "resolved"
let phase = "apart", t = 0, frame = 0, last = 0, visible = false;
let touring = !still.matches, dwell = 1.8, lampShown = "";

const startA = () => [APPROACH_X + 14, MAIN_Y];
const startB = () => [APPROACH_X + 14, FEAT_Y];
const berthA = (spread) => [BERTH_X - spread, THROAT_Y];
const berthB = (spread) => [BERTH_X + spread, THROAT_Y];

function paint(spread) {
  const [ax, ay] = phase === "apart" ? startA() : berthA(spread);
  const [bx, by] = phase === "apart" ? startB() : berthB(spread);
  const open = phase === "clash";
  wagonsG.innerHTML = wagon(WAGONS.c3, ax, ay, phase !== "apart", open)
    + wagon(WAGONS.f1, bx, by, phase !== "apart", open);
}

function setText(text) {
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function describe() {
  if (phase === "merge") return "both roads into one berth";
  if (phase === "clash") return "CONFLICT · both changed line 42";
  if (phase === "resolve") return "you edit the file by hand";
  return "resolved · both changes kept";
}

function startMerge() {
  if (phase !== "apart") return;
  if (still.matches) { phase = "resolved"; paint(6); return; }
  phase = "merge"; t = 0; run();
}
function startResolve() {
  if (phase !== "clash") return;
  if (still.matches) { phase = "resolved"; paint(6); return; }
  phase = "resolve"; t = 0; run();
}
function windBack() { phase = "apart"; t = 0; toolG.innerHTML = ""; paint(0); }
function poke() {
  touring = false;
  clearTimeout(poke.t);
  if (phase === "apart") startMerge();
  else if (phase === "clash") startResolve();
  else if (phase === "resolved") windBack();
  poke.t = setTimeout(() => { touring = !still.matches; dwell = 2.0; run(); }, 4200);
}

const MOVE = 2.0;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (phase === "merge") {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    const ax = startA()[0] + (BERTH_X - 2 - startA()[0]) * e;
    const ay = MAIN_Y + (THROAT_Y - MAIN_Y) * e;
    const bx = startB()[0] + (BERTH_X + 2 - startB()[0]) * e;
    const by = FEAT_Y + (THROAT_Y - FEAT_Y) * e;
    wagonsG.innerHTML = wagon(WAGONS.c3, ax, ay, true, false) + wagon(WAGONS.f1, bx, by, true, false);
    if (t >= 1) { phase = "clash"; t = 0; paint(3); }
  } else if (phase === "resolve") {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    const toolZ = CRANE_H - 4 - e * (CRANE_H - 30);
    toolG.innerHTML = lineSvg(rise([CRANE_X, THROAT_Y], CRANE_H + 5, toolZ, P), { tone: "green", flow: true })
      + dotsSvg([iso([CRANE_X, THROAT_Y, CRANE_H + 5], P), iso([CRANE_X, THROAT_Y, toolZ], P)], { size: 0.45, tone: "faint" })
      + solidSvg(cylinder(CRANE_X, THROAT_Y, 2.6, toolZ - 6, 6, P, 16), { tone: "hi" })
      + solidSvg(slabOf({ x: CRANE_X - 8, y: THROAT_Y - 4, w: 16, d: 8, r: 1 }, toolZ - 10, 4, P, 3, 0.3), { tone: "mid" });
    if (t >= 1) { phase = "resolved"; t = 0; toolG.innerHTML = ""; paint(10); }
  } else if (touring) {
    dwell -= dt;
    if (dwell <= 0) {
      if (phase === "apart") startMerge();
      else if (phase === "clash") startResolve();
      else windBack();
      dwell = 2.1;
    }
  }
  if (phase !== "resolve") toolG.innerHTML = "";
  const key = phase === "clash" ? "red" : phase === "resolved" ? "green" : "off";
  if (lampShown !== key) {
    lampShown = key;
    const tone = key === "red" ? "red" : key === "green" ? "green" : "faint";
    lampG.innerHTML = dotsSvg([iso([BERTH_X, THROAT_Y, 28.4], P)], { size: key === "off" ? 0.9 : 1.3, tone, pulse: key === "red" });
  }
  setText(describe());
  frame = visible && (phase === "merge" || phase === "resolve" || touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

stage.addEventListener("click", () => poke());
const typing = (e) => { const t = e.target; return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
document.addEventListener("keydown", (e) => { if (typing(e)) return; if (e.key === " " || e.key === "m" || e.key === "M") { e.preventDefault(); poke(); } });
paint(0);
setText(describe());
`;

const body = navHtml("conflicts", "Conflicts", "two answers for one place") + k.plateHtml({
  fig: "Fig 5",
  title: "Conflicts — two answers for one place",
  hint: "Click to merge, then resolve",
  readout: "apart",
  keys: [
    { mark: "raised", label: "A wagon from main and a wagon from feat" },
    { mark: "lit", label: "Both changed the same line, so both claim the berth" },
    { mark: "line", label: "The lamp is red while git waits for a person" },
    { mark: "line", label: "The tool is your edit: you rewrite one wagon" },
  ],
  caption: "A conflict is not a fault in git. It happens when two branches change the same line, so git has two answers for one place and cannot choose. Git stops, marks the place in the file, and waits. You edit the file to the answer you want, add it, and commit. Here the lamp turns red while the clash is open and green once both wagons fit.",
  body: '<div class="iso-stage" tabindex="0" data-touch-hint="Tap to merge, then tap to resolve" role="group" aria-label="A merge conflict, and how a person resolves it">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git conflicts", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "conflicts-light.html" : "conflicts.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
