// Shared setup for every figure in this project: locate the anatomy skill,
// resolve the theme flag, and pull in the kit.
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
  console.error("Could not find the anatomy skill. Set ANATOMY_SKILL to the folder holding SKILL.md.");
  console.error("Looked in:\n  " + candidates.join("\n  "));
  process.exit(1);
}

const SKILL = findSkill();
export const k = await import(pathToFileURL(join(SKILL, "kit/iso-kit.mjs")).href);
const inline = await import(pathToFileURL(join(SKILL, "scripts/inline-kit.mjs")).href);
export const kitScript = inline.kitScript;