// Render docs/*.md to docs/*.html, so the notes read properly on the live site.
//
// GitHub Pages serves .md as plain text (.nojekyll stops Jekyll), which made the
// site worse than the repository it came from. These documents use a small,
// fixed subset of markdown -- headings, paragraphs, ordered lists, tables,
// inline code and links -- so this renders them without a dependency, and keeps
// the build self-contained.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { HERE, k } from "./figure-kit.mjs";
import { NAV_CSS, navHtml, THEME_JS } from "./nav.mjs";

const DOCS = join(HERE, "docs");

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// A link to another document points at the rendered page, not the source, and
// shows the name without the extension.
function link(text, href) {
  const local = /^(#|https?:|mailto:)/.test(href) ? href : href.replace(/\.md(?=$|#)/, ".html");
  const label = !/^(https?:|mailto:)/.test(href) ? text.replace(/\.md$/, "") : text;
  const external = /^https?:/.test(local) ? ' rel="noopener"' : "";
  return `<a href="${local}"${external}>${label}</a>`;
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => link(text, href));
}

const cells = (line) =>
  line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

const isRule = (line) => /^\|[\s:|-]+\|$/.test(line.trim());

function render(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("## ")) { out.push(`<h2>${inline(line.slice(3))}</h2>`); i++; continue; }
    if (line.startsWith("# ")) { out.push(`<h1>${inline(line.slice(2))}</h1>`); i++; continue; }

    // a table: a row, then a rule, then rows
    if (line.trim().startsWith("|")) {
      const head = cells(line);
      const rows = [];
      i++;
      if (i < lines.length && isRule(lines[i])) i++;
      while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(cells(lines[i])); i++; }
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`
        + `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }

    // an ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; }
      out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ol>`);
      continue;
    }

    // a paragraph: everything up to the next blank line or block
    const para = [];
    while (i < lines.length && lines[i].trim()
      && !lines[i].startsWith("#") && !lines[i].trim().startsWith("|") && !/^\d+\.\s/.test(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

const files = readdirSync(DOCS).filter((n) => n.endsWith(".md")).sort();
for (const file of files) {
  const name = basename(file, ".md");
  const md = readFileSync(join(DOCS, file), "utf8");
  const title = (md.match(/^# (.+)$/m) || [, name])[1];
  const body = `${navHtml(name, "Git, explained", "the written notes", "../")}
<article class="gs-doc">
  <a class="gs-doc-back" href="../index.html">&larr; All eight figures</a>
${render(md)}
</article>`;
  const page = k.pageHtml({ title: `${title} — git, explained`, theme: "light", body, script: THEME_JS, width: 720 })
    .replace("</style>", NAV_CSS + "</style>");
  writeFileSync(join(DOCS, `${name}.html`), page);
  console.log("wrote docs/" + name + ".html");
}
