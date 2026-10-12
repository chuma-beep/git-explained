// Refresh vendor/ from an installed anatomy skill. Run: npm run vendor
import { copyFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const candidates = [
  process.env.ANATOMY_SKILL,
  join(homedir(), ".config/opencode/skills/anatomy"),
  join(homedir(), ".claude/skills/anatomy"),
  join(HERE, "node_modules/anatomy"),
  join(HERE, "..", "anatomy"),
].filter(Boolean);

const SKILL = candidates.find((dir) => existsSync(join(dir, "kit/iso-kit.mjs")));
if (!SKILL) {
  console.error("No installed anatomy skill found. Set ANATOMY_SKILL. Looked in:\n  " + candidates.join("\n  "));
  process.exit(1);
}

copyFileSync(join(SKILL, "kit/iso-kit.mjs"), join(HERE, "vendor/iso-kit.mjs"));
copyFileSync(join(SKILL, "LICENSE"), join(HERE, "vendor/LICENSE"));
console.log("refreshed vendor/iso-kit.mjs and vendor/LICENSE from " + SKILL);
console.log("now run: npm run build && npm test");
