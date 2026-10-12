// Vendored from the anatomy skill (MIT). The only function this project needs
// is kitScript(), which inlines the kit into a built page. The path is fixed to
// this directory, so the copy in vendor/ is self-contained.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export function kitScript() {
  return readFileSync(join(HERE, "iso-kit.mjs"), "utf8").replace(/^export /gm, "");
}
