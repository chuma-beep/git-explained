// Fig 7 -- tags. A plate press on a single road.
//
// The idea: a tag is a name that is fixed to ONE commit and never moves. A
// branch name moves as you commit. That difference is the whole point, and it
// is why a tag is what you use for a release.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k, kitScript, theme } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const WIDTH = 640;
const HEIGHT = 380;

const PLATE = { x: -156, y: -80, w: 312, d: 160, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const ROAD_Y = 6;
const X0 = -96;
const GAP = 40;
const SLOT = (i) => X0 + i * GAP;
const EARLIER = ["c1", "c2", "c3"];      // commits already on the road
const TAG_AT = 2;                        // c3 is the one we tag
const TAG_NAME = "v1.0";
const LATER = "c4";                      // a commit made after the tag

const PRESS_X = SLOT(TAG_AT);
const PRESS_H = 64;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [SLOT(3) + 26, ROAD_Y, PRESS_H + 10], [SLOT(0) - 26, ROAD_Y, 20]],
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
  out.push(k.faceTextSvg(k.topMatrix([X0 - 18, ROAD_Y + 18], 0.1, P, "x"), "the road of commits", { size: 4.4, tone: "faint" }));
  return out.join("");
}

function road() {
  const out = [];
  out.push(S(k.slabOf({ x: X0 - 24, y: ROAD_Y - 15, w: GAP * 3 + 48, d: 30, r: 3 }, 0, 2.4, P, 3, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan({ x: X0 - 24, y: ROAD_Y - 15, w: GAP * 3 + 48, d: 30, r: 3 }, 2), 2.4, P, 3), { tone: "faint" }));
  for (let i = 0; i < 4; i++) {
    out.push(L(k.ring(SLOT(i), ROAD_Y - 7, 1.4, 2.4, P, 12), { tone: "lo" }));
    out.push(L(k.ring(SLOT(i), ROAD_Y + 7, 1.4, 2.4, P, 12), { tone: "lo" }));
    out.push(D([at([SLOT(i), ROAD_Y, 2.4])], { size: 0.5 }));
  }
  return out.join("");
}

function wagon(id, x, lit, tagged) {
  const g = [];
  g.push(S(k.slabOf({ x: x - 11, y: ROAD_Y - 6.5, w: 22, d: 13, r: 2 }, 4.5, 2.2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 9, y: ROAD_Y - 5.5, w: 18, d: 11, r: 1.4 };
  g.push(S(k.slabOf(box, 6.7, 8, P, 3, 0.5), { tone: "hi", className: "wg-body", lit, crease: lit ? "none" : "lo" }));
  g.push(L(k.planOutline(k.insetPlan(box, 1.7), 14.7, P, 3), { tone: "faint" }));
  for (const dx of [-4.4, 0, 4.4]) {
    g.push(L(k.lineOnTop([x + dx, ROAD_Y - 5.5], [x + dx, ROAD_Y - 5.5], 7, P), { tone: "faint" }));
    g.push(L(k.lineOnTop([x + dx, ROAD_Y + 5.5], [x + dx, ROAD_Y + 5.5], 7, P), { tone: "faint" }));
  }
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]]) {
    g.push(S(k.cylinder(x + dx, ROAD_Y + dy, 2.1, 2.5, 2.2, P, 14), { tone: "mid" }));
    g.push(L(k.ring(x + dx, ROAD_Y + dy, 2.1, 4.7, P, 14), { tone: "faint" }));
  }
  g.push(k.faceTextSvg(k.topMatrix([x, ROAD_Y], 14.7, P, "x"), id, { size: 4, tone: "lo", anchor: "middle" }));
  if (tagged) g.push(tagSvg(x, ROAD_Y, 14.7));
  return `<g data-wagon="${id}">${g.join("")}</g>`;
}

// The brass plate, riveted to the roof. This is what a tag is.
function tagSvg(x, y, z) {
  const g = [];
  const plateBox = { x: x - 8, y: y - 4, w: 16, d: 8, r: 1 };
  g.push(S(k.slabOf(plateBox, z, 1.8, P, 3, 0.3), { tone: "hi", lit: true }));
  g.push(k.faceTextSvg(k.topMatrix([x, y + 1.4], z + 1.9, P, "x"), TAG_NAME, { size: 3.6, tone: "lo", anchor: "middle" }));
  for (const dx of [-6, 6]) {
    g.push(S(k.cylinder(x + dx, y, 0.7, z + 1.8, 0.9, P, 10), { tone: "mid" }));
    g.push(D([at([x + dx, y, z + 2.7])], { size: 0.45 }));
  }
  return g.join("");
}

function press() {
  const out = [];
  const x0 = PRESS_X - 20, x1 = PRESS_X + 20;
  for (const x of [x0, x1]) {
    for (const y of [ROAD_Y - 13, ROAD_Y + 13]) {
      out.push(S(k.cylinder(x, y, 2.6, 0, PRESS_H, P, 16), { tone: "mid", crease: "none" }));
      out.push(S(k.cylinder(x, y, 3.8, 0, 2, P, 16), { tone: "mid" }));
      out.push(D([at([x, y, 0])], { size: 0.5 }));
      for (const [dx, dy] of [[-5, -6], [5, -6], [-5, 6], [5, 6]])
        out.push(S(k.cylinder(x + dx, y + dy, 1, 0, 1.5, P, 10), { tone: "lo" }));
    }
    out.push(S(k.slabOf({ x: x - 3, y: ROAD_Y - 14, w: 6, d: 28, r: 1.6 }, PRESS_H, 4, P, 3, 0.4), { tone: "mid" }));
  }
  out.push(S(k.slabOf({ x: x0 - 6, y: ROAD_Y - 4, w: x1 - x0 + 12, d: 8, r: 1.8 }, PRESS_H + 4, 4, P, 3, 0.4), { tone: "mid" }));
  // a magazine of spare plates on the crown, and the descending die below
  for (let i = 0; i < 3; i++) out.push(S(k.slabOf({ x: x0 + 2, y: ROAD_Y - 3 + i * 2.2, w: 9, d: 1.6, r: 0.5 }, PRESS_H + 8, 1, P, 2, 0.2), { tone: "lo" }));
  out.push(`<g data-die></g>`);
  return out.join("");
}

// The pointer board, so you can see that main moves and the tag does not.
const BOARD = { x: 92, y: -66, w: 26, d: 62, r: 3 };
const BOARD_POS = (i) => BOARD.y + 16 + i * 16;
function pointers() {
  const out = [];
  out.push(S(k.slabOf(BOARD, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 1.6), 3, P), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([BOARD.x + BOARD.w / 2, BOARD.y + 8], 3.1, P, "x"), "names", { size: 3.2, tone: "faint", anchor: "middle" }));
  for (let i = 0; i < 4; i++) {
    out.push(L(k.lineOnTop([BOARD.x + 3, BOARD_POS(i)], [BOARD.x + 9, BOARD_POS(i)], 3.1, P), { tone: "faint" }));
    out.push(S(k.cylinder(BOARD.x + 6, BOARD_POS(i), 2.6, 3, 1.4, P, 16), { tone: "mid" }));
    out.push(D([at([BOARD.x + 6, BOARD_POS(i), 4.4])], { size: 0.4, tone: "faint" }));
  }
  out.push(`<g data-pointer></g>`);
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A plate press over a single road of commits. The press rivets a brass plate, the tag v1.0, onto one wagon. A later commit then joins the road, and the tag stays where it was.",
  body: [plate(), road(), press(), pointers(),
    `<g data-wagons></g>`, `<g data-later></g>`, `<g data-die></g>`],
});

const live = `
const P = ${JSON.stringify(P)};
const EARLIER = ${JSON.stringify(EARLIER)};
const LATER = ${JSON.stringify(LATER)};
const TAG_AT = ${TAG_AT};
const TAG_NAME = ${JSON.stringify(TAG_NAME)};
const SLOT = ${SLOT.toString()};
const X0 = ${X0};
const GAP = ${GAP};
const ROAD_Y = ${ROAD_Y};
const PRESS_X = ${PRESS_X};
const PRESS_H = ${PRESS_H};
const BOARD = ${JSON.stringify(BOARD)};
const BOARD_POS = ${BOARD_POS.toString()};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const wagonsG = svg.querySelector("[data-wagons]");
const laterG = svg.querySelector("[data-later]");
const dieG = svg.querySelector("[data-die]");
const pointerG = svg.querySelector("[data-pointer]");

const LIT = { tone: "hi", lit: true, crease: "none" };
const PLAIN = { tone: "hi", crease: "lo" };

function tagSvg(x, y, z) {
  const g = [];
  const plateBox = { x: x - 8, y: y - 4, w: 16, d: 8, r: 1 };
  g.push(solidSvg(slabOf(plateBox, z, 1.8, P, 3, 0.3), LIT));
  g.push(faceTextSvg(topMatrix([x, y + 1.4], z + 1.9, P, "x"), TAG_NAME, { size: 3.6, tone: "lo", anchor: "middle" }));
  for (const dx of [-6, 6]) {
    g.push(solidSvg(cylinder(x + dx, y, 0.7, z + 1.8, 0.9, P, 10), { tone: "mid" }));
    g.push(dotsSvg([iso([x + dx, y, z + 2.7], P)], { size: 0.45 }));
  }
  return g.join("");
}
function wagon(id, x, lit, tagged, ghost) {
  const g = [];
  g.push(solidSvg(slabOf({ x: x - 11, y: ROAD_Y - 6.5, w: 22, d: 13, r: 2 }, 4.5, 2.2, P, 3, 0.4), { tone: "mid" }));
  const box = { x: x - 9, y: ROAD_Y - 5.5, w: 18, d: 11, r: 1.4 };
  g.push(solidSvg(slabOf(box, 6.7, 8, P, 3, 0.5), ghost ? { tone: "lo", crease: "faint" } : (lit ? LIT : PLAIN)));
  g.push(lineSvg(planOutline(insetPlan(box, 1.7), 14.7, P, 3), { tone: "faint" }));
  for (const dx of [-4.4, 0, 4.4]) {
    g.push(lineSvg(lineOnTop([x + dx, ROAD_Y - 5.5], [x + dx, ROAD_Y - 5.5], 7, P), { tone: "faint" }));
    g.push(lineSvg(lineOnTop([x + dx, ROAD_Y + 5.5], [x + dx, ROAD_Y + 5.5], 7, P), { tone: "faint" }));
  }
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]]) {
    g.push(solidSvg(cylinder(x + dx, ROAD_Y + dy, 2.1, 2.5, 2.2, P, 14), { tone: "mid" }));
    g.push(lineSvg(ring(x + dx, ROAD_Y + dy, 2.1, 4.7, P, 14), { tone: "faint" }));
  }
  g.push(faceTextSvg(topMatrix([x, ROAD_Y], 14.7, P, "x"), id, { size: 4, tone: "lo", anchor: "middle" }));
  if (tagged) g.push(tagSvg(x, ROAD_Y, 14.7));
  return g.join("");
}
function pointerSvg(index) {
  const px = BOARD.x + 6;
  const py = BOARD_POS(Math.max(0, Math.min(3, index)));
  const ang = Math.atan2(SLOT(Math.max(0, Math.min(3, index))) - px, ROAD_Y - py);
  const len = 26, half = 1.9;
  const dx = Math.sin(ang), dy = Math.cos(ang);
  const nx = dy, ny = -dx;
  const pts = [
    [px - nx * half, py - ny * half],
    [px + dx * len - nx, py + dy * len - ny],
    [px + dx * len + nx, py + dy * len + ny],
    [px + nx * half, py + ny * half],
  ];
  const out = [];
  out.push(solidSvg(extrude(pts, 4, 1.8, P), LIT));
  const hx = px + dx * len, hy = py + dy * len;
  out.push(solidSvg(cylinder(hx, hy, 2.4, 4, 2, P, 16), { tone: "mid" }));
  out.push(dotsSvg([iso([hx, hy, 6], P)], { size: 0.65, tone: "hi" }));
  return out.join("");
}

// tagged: the tag is on. arrived: c4 has joined the road.
let tagged = false, arrived = false, t = 0, mode = "idle", frame = 0, last = 0, visible = false;
let touring = !still.matches, dwell = 1.6;

function paint() {
  wagonsG.innerHTML = EARLIER.map((id, i) => wagon(id, SLOT(i), false, tagged && i === TAG_AT, false)).join("");
  laterG.innerHTML = arrived ? wagon(LATER, SLOT(3), true, false, false) : "";
  pointerG.innerHTML = pointerSvg(arrived ? 3 : TAG_AT);
}

function setText(text) {
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function describe() {
  if (mode === "tag") return "git tag " + TAG_NAME + " · riveting the plate onto " + EARLIER[TAG_AT];
  if (mode === "commit") return "git commit · " + LATER + " joins the road";
  if (!tagged) return "no tag · the press will name one commit";
  if (!arrived) return TAG_NAME + " is on " + EARLIER[TAG_AT] + " · now commit again";
  return TAG_NAME + " still on " + EARLIER[TAG_AT] + " · main moved to " + LATER;
}

function startTag() {
  if (mode !== "idle" || tagged) return;
  if (still.matches) { tagged = true; paint(); return; }
  mode = "tag"; t = 0; run();
}
function startCommit() {
  if (mode !== "idle" || !tagged || arrived) return;
  if (still.matches) { arrived = true; paint(); return; }
  mode = "commit"; t = 0; run();
}
function windBack() { tagged = false; arrived = false; mode = "idle"; t = 0; dieG.innerHTML = ""; paint(); }
function poke() {
  touring = false;
  clearTimeout(poke.t);
  if (mode === "idle") {
    if (!tagged) startTag();
    else if (!arrived) startCommit();
    else windBack();
  }
  poke.t = setTimeout(() => { touring = !still.matches; dwell = 1.9; run(); }, 4200);
}

const MOVE = 1.5;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (mode === "tag") {
    t = Math.min(1, t + dt / MOVE);
    const e = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
    const dieZ = PRESS_H - 6 - e * (PRESS_H - 26);
    dieG.innerHTML = solidSvg(cylinder(PRESS_X, ROAD_Y, 3, dieZ - 5, 5, P, 16), { tone: "hi" })
      + solidSvg(slabOf({ x: PRESS_X - 8, y: ROAD_Y - 4, w: 16, d: 8, r: 1 }, dieZ - 9, 4, P, 3, 0.3), { tone: "mid" })
      + dotsSvg([iso([PRESS_X, ROAD_Y, dieZ - 9], P)], { size: 0.55, tone: "hi" });
    if (t >= 1) { tagged = true; mode = "idle"; t = 0; dieG.innerHTML = ""; paint(); }
  } else if (mode === "commit") {
    t = Math.min(1, t + dt / MOVE);
    const e = t * t * (3 - 2 * t);
    const x = SLOT(3) + 60 * (1 - e);
    laterG.innerHTML = wagon(LATER, x, true, false, false);
    if (t >= 1) { arrived = true; mode = "idle"; t = 0; paint(); }
  } else if (touring) {
    dwell -= dt;
    if (dwell <= 0) {
      if (!tagged) startTag();
      else if (!arrived) startCommit();
      else windBack();
      dwell = 2.0;
    }
  }
  if (mode === "idle") dieG.innerHTML = "";
  setText(describe());
  frame = visible && (mode !== "idle" || touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

stage.addEventListener("click", () => poke());
stage.addEventListener("keydown", (e) => { if (e.key === "t" || e.key === "T" || e.key === " ") { e.preventDefault(); poke(); } });
paint();
setText(describe());
`;

const body = navHtml("tags", "Git tags", "a name that does not move") + k.plateHtml({
  fig: "Fig 8",
  title: "Tags — a name that does not move",
  hint: "Click to tag, then commit · t",
  readout: "no tag",
  keys: [
    { mark: "raised", label: "The road: commits in order" },
    { mark: "lit", label: "The brass plate: the tag, fixed to one commit" },
    { mark: "line", label: "The press rivets the tag on (git tag)" },
    { mark: "line", label: "The board holds the names and where each points" },
  ],
  caption: "A branch name moves every time you commit. A tag does not move. git tag fixes a name to one commit and leaves it there, which is why a release is a tag: v1.0 must always mean the same code. Watch the plate: a new commit joins the road and the pointer moves past it, but the plate stays on c3.",
  body: '<div class="iso-stage" tabindex="0" data-touch-hint="Tap to rivet the tag, then to commit" role="group" aria-label="Tags: a name fixed to one commit">' + svg + "</div>",
});

const page = k.pageHtml({ title: "Git tags", theme, body, script: kitScript() + live + THEME_JS })
  .replace("</style>", NAV_CSS + "</style>");
const name = theme === "light" ? "tags-light.html" : "tags.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
