// Shared page chrome: the nav that links the four figures, and the theme
// switcher. Every figure imports this so the set stays navigable.
export const NAV_CSS = `
.gs-nav{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:16px;flex-wrap:wrap;width:min(680px,100% - 32px);margin:0 auto;padding:14px 0 12px;background:linear-gradient(var(--anatomy-page) 72%,transparent);backdrop-filter:blur(6px)}
.iso-hit{fill:transparent;stroke:none}
.gs-nav-title{font:600 13px/1 var(--anatomy-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--anatomy-strong);margin:0}
.gs-nav-sub{font:12px/1 var(--anatomy-mono);color:var(--anatomy-muted);letter-spacing:.04em}
.gs-nav-spacer{flex:1}
.gs-links{display:flex;gap:4px;flex-wrap:wrap}
.gs-links a{font:11px/1 var(--anatomy-mono);letter-spacing:.05em;text-transform:uppercase;text-decoration:none;color:var(--anatomy-muted);padding:6px 9px;border-radius:999px;border:1px solid transparent;transition:color .18s var(--anatomy-ease),border-color .18s var(--anatomy-ease)}
.gs-links a:hover{color:var(--anatomy-text);border-color:var(--anatomy-lo)}
.gs-links a[aria-current="page"]{color:var(--anatomy-strong);background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-lo) inset}
.gs-links a:focus-visible{outline:2px solid var(--anatomy-lit);outline-offset:1px}
.gs-switch{display:flex;gap:2px;padding:2px;border:1px solid var(--anatomy-lo);border-radius:999px}
.gs-switch button{font:11px/1 var(--anatomy-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--anatomy-muted);background:none;border:0;border-radius:999px;padding:6px 12px;cursor:pointer;transition:color .18s var(--anatomy-ease),background .18s var(--anatomy-ease)}
.gs-switch button:hover{color:var(--anatomy-text)}
.gs-switch button[aria-pressed="true"]{color:var(--anatomy-strong);background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-lo) inset}
.gs-switch button:focus-visible{outline:2px solid var(--anatomy-lit);outline-offset:1px}
@media (max-width:640px){
  /* Two rows: title and switch, then the links. The links scroll sideways
     rather than wrap, so the header keeps one compact height. */
  .gs-nav{gap:8px 10px;padding:10px 0 8px;align-items:center}
  .gs-nav-title{font-size:12px;letter-spacing:.06em}
  .gs-nav-sub{display:none}
  .gs-links{order:9;width:100%;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:2px;padding-bottom:2px}
  .gs-links::-webkit-scrollbar{display:none}
  .gs-links a{padding:7px 10px;font-size:10px;white-space:nowrap}
  .gs-switch button{padding:7px 12px}
  /* Less space above the figure, and a smaller plate margin. */
  .iso-page{margin:14px auto 40px}
  .iso-plate{padding:44px 12px 58px}
  .iso-figure{margin:18px 0 22px}
}
@media (max-width:380px){
  .iso-page{margin:10px auto 32px}
  .iso-plate{padding:40px 8px 54px}
  .gs-nav{gap:6px 8px}
  .gs-nav-title{font-size:11px}
  .gs-switch button{padding:6px 9px;font-size:10px}
  .gs-links a{padding:6px 8px}
}
`;

// `current` is the key of the figure this page is; the theme switch follows the
// reader's saved preference so every page opens in the theme they last chose.
export const FIGURES = [
  { key: "switchyard", label: "Branch & merge", href: "index.html", alt: "git-switchyard-light.html" },
  { key: "remotes", label: "Remotes", href: "remotes-light.html", alt: "remotes.html" },
  { key: "rebase", label: "Rebase", href: "rebase-light.html", alt: "rebase.html" },
  { key: "pr", label: "Pull request", href: "pull-request-light.html", alt: "pull-request.html" },
];

export function navHtml(current, title, sub) {
  const links = FIGURES.map((f) => {
    const here = f.key === current ? ' aria-current="page"' : "";
    return `<a href="${f.href}"${here}>${f.label}</a>`;
  }).join("");
  return `
<nav class="gs-nav">
  <h1 class="gs-nav-title">${title}</h1>
  <span class="gs-nav-sub">${sub}</span>
  <span class="gs-nav-spacer"></span>
  <div class="gs-links">${links}</div>
  <div class="gs-switch" role="group" aria-label="Colour theme">
    <button type="button" data-set-theme="light">Light</button>
    <button type="button" data-set-theme="dark">Dark</button>
  </div>
</nav>`;
}

// Wrapped in a block so its names cannot collide with a figure's own script.
// Both are concatenated into one module, and a duplicate const is a
// SyntaxError that stops the whole page.
export const THEME_JS = `
{
  const root = document.body;
  const saved = localStorage.getItem("gs-theme");
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  const themeButtons = [...document.querySelectorAll("[data-set-theme]")];
  const syncTheme = () => {
    for (const b of themeButtons) b.setAttribute("aria-pressed", String(b.dataset.setTheme === root.dataset.theme));
  };
  syncTheme();
  for (const b of themeButtons) b.addEventListener("click", () => {
    root.dataset.theme = b.dataset.setTheme;
    localStorage.setItem("gs-theme", b.dataset.setTheme);
    syncTheme();
  });
  // A touch screen has no hover. Swap the hint for one that names a gesture.
  const touchStage = document.querySelector(".iso-stage");
  if (touchStage && touchStage.dataset.touchHint && matchMedia("(hover: none)").matches) {
    const hint = document.querySelector('[data-corner="hint"]');
    if (hint) hint.textContent = touchStage.dataset.touchHint;
  }
}
`;
