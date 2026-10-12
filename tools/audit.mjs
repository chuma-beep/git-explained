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

const actions = [
  ["wait", 1400],
  ["eval", MOTION],
  ["lines", null, ".iso-plate", { tolerance: 1.2 }],
];

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const figures = only.length ? only : FIGURES;
const themes = ["", "-light"];

let failed = 0;
for (const figure of figures) {
  for (const suffix of themes) {
    const page = figure + suffix + ".html";
    if (!existsSync(join(ROOT, page))) {
      console.log(`FAIL ${page}  (file not found — run npm run build)`);
      failed++;
      continue;
    }
    const run = spawnSync(process.execPath, [join(HERE, "drive.mjs"), join(ROOT, page), JSON.stringify(actions)], {
      encoding: "utf8",
      timeout: 120000,
    });
    const out = (run.stdout || "") + (run.stderr || "");

    const motion = /"distinct":(\d+)/.exec(out);
    const distinct = motion ? Number(motion[1]) : 0;
    const moved = distinct > 1;

    const lineMatch = /line ends: (\d+) of \d+ ends/.exec(out);
    const floating = lineMatch ? Number(lineMatch[1]) : null;
    const clean = floating === 0;

    const exception = /exception:|console\.error/.test(out);

    const ok = moved && clean && !exception;
    const parts = [
      moved ? `moves (${distinct} states)` : "STATIC",
      clean ? "lines 0" : floating === null ? "lines NOT RUN" : `lines ${floating} floating`,
      exception ? "CONSOLE ERROR" : "console clean",
    ];
    console.log(`${ok ? "ok  " : "FAIL"} ${page.padEnd(26)} ${parts.join(" · ")}`);
    if (!ok) {
      failed++;
      if (!moved) console.log("     the figure did not change in 3.6 s with no input");
      if (floating) console.log("     run the lines action by hand and read the report");
      if (exception) console.log("     a console error or exception stopped the page");
    }
  }
}

console.log(failed ? `\n${failed} check(s) failed` : "\nall figures passed");
process.exit(failed ? 1 : 0);
