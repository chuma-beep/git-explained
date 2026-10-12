// The landing page. `/` is this page now: it says what the set is, shows the
// eight figures as cards, and carries the same nav and theme switch as the
// figures, so clicking through keeps the reader in one place.
//
// The hero is a short rail with eight wagons, one per figure, and a trolley
// that idles along them. It is decoration: the cards below are the navigation,
// so the page still works with the hero switched off or unanimated.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERE, k } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS, FIGURES } from "./nav.mjs";

const PAGE_WIDTH = 820;
const HERO_W = 900;
const HERO_H = 182;

// One card per figure. `object` and `idea` are the same words the README uses.
const CARDS = [
  { key: "staging", name: "Staging", object: "Packing bench", idea: "You edit on the bench, add puts a change in the tray, and commit seals the tray into a crate on the rack. A change left on the bench is not in the commit." },
  { key: "switchyard", name: "Branch & merge", object: "Signal-box junction", idea: "Commits are wagons and branches are roads. main runs A-B-C-F, feat leaves the line at B and runs D-E, and F is a merge commit with two parents." },
  { key: "clone", name: "Clone", object: "Mill that makes copies", idea: "clone copies the whole history, not only the files, and adds two names you did not have: origin, and origin/main." },
  { key: "remotes", name: "Remotes", object: "Goods yard, two bays", idea: "A remote is another copy of your wagons. push lifts one to the far bay, fetch downloads without merging, and pull also puts it on your road." },
  { key: "conflicts", name: "Conflicts", object: "Two roads, one berth", idea: "A conflict is not a fault in git. Two branches change the same line, so git has two answers for one place, stops, and waits for a person." },
  { key: "rebase", name: "Rebase", object: "Gantry over two beds", idea: "Rebase does not merge. It replays your commits on a new base, so they return with new ids, a straight history, and no merge commit." },
  { key: "pr", name: "Pull request", object: "Goods gate, review lamp", idea: "A pull request is a gate, not a move. Your branch cannot reach main until a reviewer clears it, and then the merge commit appears." },
  { key: "tags", name: "Tags", object: "Plate press", idea: "A branch name moves every time you commit. A tag does not move, which is why a release is a tag and v1.0 always means the same code." },
];

const hrefFor = (key) => {
  const found = FIGURES.find((f) => f.key === key);
  return found ? found.href : "#";
};

// ---- the hero -------------------------------------------------------------

const N = CARDS.length;
const SPACING = 30;
const X0 = -((N - 1) * SPACING) / 2;
const slotX = (i) => X0 + i * SPACING;

const P = k.fitProjection(
  [...k.boxCorners({ x: X0 - 34, y: -22, w: (N - 1) * SPACING + 68, d: 44, r: 3 }, -8, 0), [0, 0, 46]],
  HERO_W, HERO_H, { pad: 10, headroom: 16, azimuth: 46, elevation: 27 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);

function heroWagon(i) {
  const x = slotX(i);
  const g = [];
  g.push(S(k.slabOf({ x: x - 11, y: -6.5, w: 22, d: 13, r: 2 }, 3.4, 2.2, P, 3, 0.3), { tone: "mid" }));
  const box = { x: x - 9, y: -5.5, w: 18, d: 11, r: 1.5 };
  g.push(S(k.slabOf(box, 5.6, 7.4, P, 3, 0.4), { tone: "hi", className: "hero-body", crease: "lo" }));
  g.push(L(k.planOutline(k.insetPlan(box, 1.6), 13, P, 3), { tone: "faint" }));
  for (const [dx, dy] of [[-7, -5.4], [7, -5.4], [-7, 5.4], [7, 5.4]])
    g.push(S(k.cylinder(x + dx, dy, 2, 1, 2, P, 12), { tone: "mid" }));
  g.push(k.faceTextSvg(k.topMatrix([x, 0], 13, P, "x"), String(i + 1), { size: 5.6, tone: "lo", anchor: "middle" }));
  return `<g data-hero-wagon="${i}">${g.join("")}</g>`;
}

function heroTrolley() {
  const x = slotX(0);
  const g = [];
  g.push(S(k.cylinder(x, -9, 1.6, 0, 34, P, 12), { tone: "mid", crease: "none" }));
  g.push(S(k.cylinder(x, 9, 1.6, 0, 34, P, 12), { tone: "mid", crease: "none" }));
  g.push(S(k.slabOf({ x: x - 5, y: -11, w: 10, d: 22, r: 2 }, 34, 3.4, P, 3, 0.3), { tone: "mid" }));
  g.push(S(k.slabOf({ x: x - 6, y: -7, w: 12, d: 14, r: 2 }, 26, 5, P, 3, 0.4), { tone: "hi", className: "tint-amber" }));
  g.push(S(k.cylinder(x, 0, 1.6, 21, 5, P, 12), { tone: "mid", crease: "none" }));
  g.push(D([at([x, 0, 38.4])], { size: 0.9, tone: "amber", pulse: true }));
  return g.join("");
}

function hero() {
  const out = [];
  const bed = { x: X0 - 30, y: -20, w: (N - 1) * SPACING + 60, d: 40, r: 3 };
  out.push(S(k.slabOf(bed, -8, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(bed, 2.4), -4, P, 3), { tone: "faint" }));
  for (const [x, y] of k.corners({ x: X0 - 24, y: -16, w: (N - 1) * SPACING + 48, d: 32, r: 3 }, 12)) {
    out.push(S(k.cylinder(x, y, 1.6, -8, 1.4, P, 12), { tone: "lo" }));
    out.push(D([at([x, y, -8])], { size: 0.4 }));
  }
  // rails
  for (const off of [-4.6, 4.6])
    out.push(S(k.slabOf({ x: X0 - 20, y: off - 0.8, w: (N - 1) * SPACING + 40, d: 1.6, r: 0.7 }, 2.4, 1.4, P, 2, 0.2), { tone: "mid" }));
  for (let i = 0; i < N; i++)
    for (const off of [-6, 6]) out.push(L(k.ring(slotX(i), off, 1, 3.8, P, 10), { tone: "faint" }));
  out.push(CARDS.map((_, i) => heroWagon(i)).join(""));
  // the trolley is drawn at slot 0 and moved by a screen-space translate
  out.push(`<g data-hero-trolley>${heroTrolley()}</g>`);
  return out.join("");
}

const HERO_STOPS = CARDS.map((_, i) => {
  const [dx, dy] = k.axisVector(P, [slotX(i) - slotX(0), 0, 0]);
  return [Math.round(dx * 100) / 100, Math.round(dy * 100) / 100];
});

const heroSvg = k.figureSvg({
  width: HERO_W, height: HERO_H,
  label: "A short rail with eight wagons and a trolley that runs along them.",
  body: hero(),
});

// ---- the page -------------------------------------------------------------

const cards = CARDS.map((c, i) => `
    <li>
      <a class="gs-card" href="${hrefFor(c.key)}">
        <span class="gs-card-top"><span class="gs-fig">Fig ${i + 1}</span><span class="gs-card-name">${c.name}</span></span>
        <span class="gs-card-obj">${c.object}</span>
        <p class="gs-card-idea">${c.idea}</p>
      </a>
    </li>`).join("");

const body = navHtml("home", "Git, explained", "eight figures") + `
<section class="gs-hero" aria-hidden="true">${heroSvg}</section>
<span class="gs-hero-cap">Eight figures · one wagon each · start at Figure 1</span>

<p class="gs-lead"><strong>Git is easier when you can see it move.</strong> Each figure is a small machine whose working <em>is</em> the idea: commits are wagons, branches are roads, a remote is a second yard. Open one and the mechanism explains the command.</p>

<p class="gs-lead">Read them in order. Each figure has a written counterpart in Simplified Technical English.</p>

<div class="gs-legend" role="list">
  <span role="listitem"><i class="gs-dot" data-c="blue"></i>the other branch, the remote, origin</span>
  <span role="listitem"><i class="gs-dot" data-c="amber"></i>yours: your branch, your bay, HEAD, a tag</span>
  <span role="listitem"><i class="gs-dot" data-c="green"></i>committed, merged, resolved</span>
  <span role="listitem"><i class="gs-dot" data-c="red"></i>stopped: a conflict</span>
</div>

<ul class="gs-cards">${cards}
</ul>

<footer class="gs-foot">
  <a href="docs/index.html">The written notes</a>
  <a href="https://github.com/chuma-beep/git-explained">Source on GitHub</a>
  <a href="https://github.com/chuma-beep/git-explained/blob/main/LICENSE">MIT licence</a>
  <span>Built with the anatomy skill · no framework</span>
</footer>`;

const live = `
{
  // On a first visit with no saved choice, follow the operating system.
  if (!localStorage.getItem("gs-theme") && matchMedia("(prefers-color-scheme: light)").matches) {
    document.body.dataset.theme = "light";
  }
}
(() => {
  const root = document.querySelector(".gs-hero");
  if (!root) return;
  const trolley = root.querySelector("[data-hero-trolley]");
  const bodies = [...root.querySelectorAll(".hero-body")];
  const stops = ${JSON.stringify(HERO_STOPS)};
  const draw = (i) => {
    trolley.setAttribute("transform", "translate(" + stops[i][0] + " " + stops[i][1] + ")");
    bodies.forEach((b, j) => {
      if (j === i) b.setAttribute("data-lit", ""); else b.removeAttribute("data-lit");
    });
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { draw(0); return; }
  let i = 0, t = 0, last = 0, dwell = 1.1;
  const ease = (v) => v * v * (3 - 2 * v);
  const HOLD = 1.5, MOVE = 0.85;
  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (t === 0 && dwell > 0) {
      dwell -= dt;
      draw(i);
    } else {
      t = Math.min(1, t + dt / MOVE);
      const e = ease(t);
      const a = stops[i], b = stops[(i + 1) % stops.length];
      trolley.setAttribute("transform", "translate(" + (a[0] + (b[0] - a[0]) * e) + " " + (a[1] + (b[1] - a[1]) * e) + ")");
      bodies.forEach((el, j) => el.removeAttribute("data-lit"));
      if (t >= 1) { i = (i + 1) % stops.length; t = 0; dwell = HOLD; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
`;

const page = k.pageHtml({ title: "Git, explained as a working machine", theme: "light", body, script: THEME_JS + live, width: PAGE_WIDTH })
  .replace("</style>", NAV_CSS + "</style>");
writeFileSync(join(HERE, "index.html"), page);
console.log("wrote index.html");
