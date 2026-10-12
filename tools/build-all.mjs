// Build every figure, in both themes. Discovers the build scripts, so a new
// figure needs no change here.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

export const buildScripts = () =>
  readdirSync(ROOT).filter((name) => /^build(-[a-z-]+)?\.mjs$/.test(name)).sort();

export const figurePages = () =>
  readdirSync(ROOT).filter((name) => name.endsWith(".html") && name !== "index.html").sort();

const scripts = buildScripts();
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const script of scripts) {
    for (const args of [[], ["--light"]]) {
      const result = spawnSync(process.execPath, [join(ROOT, script), ...args], { stdio: "inherit" });
      if (result.status !== 0) process.exit(result.status ?? 1);
    }
  }
}
