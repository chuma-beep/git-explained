// Rebuild both themes whenever build.mjs (or the anatomy kit) changes.
// Vite serves the output and full-reloads when the HTML is rewritten.
import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

function findSkill() {
  const candidates = [
    process.env.ANATOMY_SKILL,
    join(process.env.HOME ?? "", ".config/opencode/skills/anatomy"),
    join(process.env.HOME ?? "", ".claude/skills/anatomy"),
  ].filter(Boolean);
  for (const dir of candidates) if (existsSync(join(dir, "kit/iso-kit.mjs"))) return dir;
  return null;
}

const SKILL = findSkill();
if (!SKILL) {
  console.error("Could not find the anatomy skill; set ANATOMY_SKILL.");
  process.exit(1);
}

let building = false;
let queued = false;

import { buildScripts } from "./tools/build-all.mjs";
const FIGURES = buildScripts();

function run(script, args) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [join(HERE, script), ...args], { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code !== 0) console.error(script, "failed with code", code);
      done();
    });
  });
}

async function build() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  for (const script of FIGURES) {
    await run(script, []);
    await run(script, ["--light"]);
  }
  building = false;
  if (queued) {
    queued = false;
    build();
  }
}

let timer = 0;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(build, 120);
}

// Watch directories, not files: an editor or `sed -i` replaces a file by
// renaming a new inode over it, which silently kills a watch bound to the old
// inode. Watching the directory sees the rename as a change to the name.
function watchPath(dir, match) {
  if (!existsSync(dir)) return;
  watch(dir, (_event, name) => {
    if (!name || match(name)) schedule();
  });
}

watchPath(HERE, (name) => /^(build|figure-kit|nav|watch)\S*\.mjs$/.test(name));
watchPath(join(SKILL, "kit"), () => true);
watchPath(join(SKILL, "scripts"), () => true);

console.log("watching the figure builds and the anatomy kit — edit any to rebuild");
build();