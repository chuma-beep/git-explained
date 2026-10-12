// Check every figure, in both themes, in a real browser.
//
// Two checks per page, because both have failed silently before:
//
//   motion  the figure must change while nobody touches it. A throw inside
//           requestAnimationFrame kills the loop and freezes the page with no
//           error anywhere, so "does it move" is the check that catches it.
//   lines   every texture line must end on a stroke, a dot or an outline.
//
// Usage: node tools/audit.mjs            all figures, both themes
//        node tools/audit.mjs remotes    one figure
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

// Base figure names. Read the built pages, drop index.html (a copy of one of
// them), and fold the -light pages back onto their base name so each figure is
// audited once per theme.
const FIGURES = [...new Set(
  readdirSync(ROOT)
    .filter((name) => name.endsWith(".html") && name !== "index.html")
    .map((name) => name.replace(/\.html$/, "").replace(/-light$/, "")),
)].sort();

// Sample a signature of every path and transform for ~3.6 s and count the
// distinct states. One state means the figure never moved.
const MOTION = `(()=>{
  const snap=()=>[...document.querySelectorAll(".iso-svg *")]
    .map(e=>e.getAttribute("d")||e.getAttribute("transform")||"").join("|");
  const seen=new Set();
  return new Promise(done=>{
    let n=0;
    const id=setInterval(()=>{
      seen.add(snap());
      if(++n>=8){clearInterval(id);done({samples:n,distinct:seen.size});}
    },450);
  });
})()`;

// The figures tour on their own, so the two checks need different moments.
// The line check must run while the figure is at rest, before the tour's first
// step: a line that is correctly rooted can still float mid-stroke. The motion
// check then samples for a few seconds and counts distinct states.
const LINES_ACTIONS = [
  ["wait", 900],
  ["lines", null, ".iso-plate", { tolerance: 1.2 }],
];
const MOTION_ACTIONS = [
  ["wait", 1400],
  ["eval", MOTION],
];

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const figures = only.length ? only : FIGURES;
const themes = ["", "-light"];

const drive = (page, actions) =>
  spawnSync(process.execPath, [join(HERE, "drive.mjs"), join(ROOT, page), JSON.stringify(actions)], {
    encoding: "utf8",
    timeout: 120000,
  });

let failed = 0;
for (const figure of figures) {
  for (const suffix of themes) {
    const page = figure + suffix + ".html";
    if (!existsSync(join(ROOT, page))) {
      console.log(`FAIL ${page}  (file not found — run npm run build)`);
      failed++;
      continue;
    }

    const lineRun = drive(page, LINES_ACTIONS);
    const lineOut = (lineRun.stdout || "") + (lineRun.stderr || "");
    const lineMatch = /line ends: (\d+) of \d+ ends/.exec(lineOut);
    const floating = lineMatch ? Number(lineMatch[1]) : null;
    const clean = floating === 0;

    const motionRun = drive(page, MOTION_ACTIONS);
    const motionOut = (motionRun.stdout || "") + (motionRun.stderr || "");
    const motion = /"distinct":(\d+)/.exec(motionOut);
    const distinct = motion ? Number(motion[1]) : 0;
    const moved = distinct > 1;

    const exception = /exception:|console\.error/.test(lineOut + motionOut);

    const ok = moved && clean && !exception;
    const parts = [
      moved ? `moves (${distinct} states)` : "STATIC",
      clean ? "lines 0" : floating === null ? "lines NOT RUN" : `lines ${floating} floating`,
      exception ? "CONSOLE ERROR" : "console clean",
    ];
    console.log(`${ok ? "ok  " : "FAIL"} ${page.padEnd(26)} ${parts.join(" · ")}`);
    if (!ok) {
      failed++;
      if (!moved) console.log("     the figure did not change in ~3.6 s with no input");
      if (floating) console.log("     " + lineOut.split("\n").find((l) => /px from/.test(l))?.trim());
      if (exception) console.log("     a console error or exception stopped the page");
      // Show what the driver actually said, so a failure on another machine is
      // readable without guessing.
      console.log("----- lines pass output -----");
      console.log(lineOut.trim().split("\n").slice(0, 12).map((l) => "     " + l).join("\n") || "     (empty)");
      console.log("----- motion pass output -----");
      console.log(motionOut.trim().split("\n").slice(0, 12).map((l) => "     " + l).join("\n") || "     (empty)");
    }
  }
}

// The landing page is not a figure, so it is not in FIGURES and the motion and
// line checks would fail it. It still needs watching: it is the first thing
// anyone sees, and it carries a hero that moves.
const LANDING = `(() => {
  const trolley = document.querySelector("[data-hero-trolley]");
  const before = trolley ? trolley.getAttribute("transform") : null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  const cards = document.querySelectorAll(".gs-card").length;
  const hero = !!document.querySelector(".gs-hero svg");
  return new Promise((done) => setTimeout(() => {
    const after = trolley ? trolley.getAttribute("transform") : null;
    done({ overflow, cards, hero, reduced, moved: before !== after });
  }, 1700));
})()`;

if (!only.length && existsSync(join(ROOT, "index.html"))) {
  const run = drive("index.html", [["wait", 1500], ["eval", LANDING]]);
  const out = (run.stdout || "") + (run.stderr || "");
  const state = /eval: (\{.*\})/.exec(out);
  const exception = /exception:|console\.error/.test(out);
  if (!state) {
    console.log("FAIL index.html                 (the landing check did not return a result)");
    console.log(out.trim().split("\n").slice(0, 12).map((l) => "     " + l).join("\n") || "     (empty)");
    failed++;
  } else {
    const s = JSON.parse(state[1]);
    const ok = !s.overflow && !exception && s.cards >= 8 && s.hero && (s.moved || s.reduced);
    const parts = [
      s.hero ? `hero, ${s.cards} cards` : "NO HERO",
      s.overflow ? "OVERFLOWS" : "fits",
      s.reduced ? "reduced motion (still)" : s.moved ? "hero moves" : "HERO STATIC",
      exception ? "CONSOLE ERROR" : "console clean",
    ];
    console.log(`${ok ? "ok  " : "FAIL"} ${"index.html".padEnd(26)} ${parts.join(" · ")}`);
    if (!ok) failed++;
  }
}

console.log(failed ? `\n${failed} check(s) failed` : "\nall figures passed");
process.exit(failed ? 1 : 0);