// Shared setup for every figure in this project: resolve the theme flag and
// pull in the kit. The kit in vendor/ wins, so a clone builds on its own; an
// installed anatomy skill is the fallback.
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const theme = process.argv.includes("--light") ? "light" : "dark";

// Locate the anatomy skill. ANATOMY_SKILL wins; otherwise try the places the
// skill is installed. Run `npx skills add wheresryan22/anatomy -g -a opencode`.
export function findSkill() {
  const candidates = [
    process.env.ANATOMY_SKILL,
    join(homedir(), ".config/opencode/skills/anatomy"),
    join(homedir(), ".claude/skills/anatomy"),
    join(HERE, "node_modules/anatomy"),
    join(HERE, "..", "anatomy"),
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, "kit/iso-kit.mjs"))) return dir;
  }
  console.error("Could not find the anatomy kit. This repository has a copy in vendor/.");
  console.error("If vendor/ is absent, set ANATOMY_SKILL to the folder holding SKILL.md.");
  console.error("Looked in:\n  " + candidates.join("\n  "));
  process.exit(1);
}

const load = (kitFile, inlineFile) => Promise.all([
  import(pathToFileURL(kitFile).href),
  import(pathToFileURL(inlineFile).href),
]);

const VENDOR = join(HERE, "vendor");
let kit;
if (existsSync(join(VENDOR, "iso-kit.mjs"))) {
  kit = await load(join(VENDOR, "iso-kit.mjs"), join(VENDOR, "inline-kit.mjs"));
} else {
  const SKILL = findSkill();
  console.warn("vendor/ is absent — using the installed anatomy skill at " + SKILL);
  kit = await load(join(SKILL, "kit/iso-kit.mjs"), join(SKILL, "scripts/inline-kit.mjs"));
}

export const k = kit[0];
export const kitScript = kit[1].kitScript;