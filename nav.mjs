// Shared page chrome: the nav that links the four figures, and the theme
// switcher. Every figure imports this so the set stays navigable.
export const NAV_CSS = `
.gs-nav{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;margin:0 auto;padding:14px 0 10px;background:linear-gradient(var(--anatomy-page) 76%,transparent);backdrop-filter:blur(6px)}
.iso-hit{fill:transparent;stroke:none}

/* A small colour language, the same in every figure:
     blue  the other branch, the remote, origin
     amber yours, HEAD, attention
     green committed, resolved, clear to go
     red   stopped, in conflict
   Only the top face is tinted, so the four-tone shading still reads. */
.iso{--gs-amber:#f0a24a;--gs-blue-top:#20344a;--gs-amber-top:#3b2f19;--gs-green-top:#1b3226;--gs-red-top:#3a2024}
.iso[data-theme="light"]{--gs-amber:#b8691a;--gs-blue-top:#cfe0f5;--gs-amber-top:#f4e2bd;--gs-green-top:#cfe9da;--gs-red-top:#f5d7da}
.tint-blue>.iso-top{fill:var(--gs-blue-top)}
.tint-amber>.iso-top{fill:var(--gs-amber-top)}
.tint-green>.iso-top{fill:var(--gs-green-top)}
.tint-red>.iso-top{fill:var(--gs-red-top)}
.tint-blue>.iso-edge{stroke:var(--anatomy-blue)}
.tint-amber>.iso-edge{stroke:var(--gs-amber)}
.tint-green>.iso-edge{stroke:var(--anatomy-green)}
.tint-red>.iso-edge{stroke:var(--anatomy-red)}
/* lamps: a filled, coloured dot instead of the default grey one */
.iso-dots[data-tone="red"] circle{fill:var(--anatomy-red);opacity:1}
.iso-dots[data-tone="green"] circle{fill:var(--anatomy-green);opacity:1}
.iso-dots[data-tone="blue"] circle{fill:var(--anatomy-blue);opacity:1}
.iso-dots[data-tone="amber"] circle{fill:var(--gs-amber);opacity:1}
.iso-dots[data-tone="red"] circle{filter:drop-shadow(0 0 4px var(--anatomy-red))}
.iso-dots[data-tone="green"] circle{filter:drop-shadow(0 0 4px var(--anatomy-green))}
.iso-dots[data-tone="blue"] circle{filter:drop-shadow(0 0 4px var(--anatomy-blue))}
.iso-dots[data-tone="amber"] circle{filter:drop-shadow(0 0 4px var(--gs-amber))}
.iso-dots[data-glow] circle{filter:drop-shadow(0 0 5px currentColor)}
/* a lit solid can carry a colour edge without losing its shading */
.iso-solid[data-lit].tint-amber>.iso-edge{stroke:var(--gs-amber)}
.iso-solid[data-lit].tint-blue>.iso-edge{stroke:var(--anatomy-blue)}
.gs-nav-title{font:600 13px/1 var(--anatomy-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--anatomy-strong);margin:0}
.gs-nav-sub{font:12px/1 var(--anatomy-mono);color:var(--anatomy-muted);letter-spacing:.04em}
.gs-nav-spacer{flex:1}
.gs-links{order:9;width:100%;display:flex;gap:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.gs-links::-webkit-scrollbar{display:none}
.gs-links a{white-space:nowrap}
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
  .gs-nav{gap:8px 10px;padding:10px 0 8px;align-items:center}
  .gs-nav-title{font-size:12px;letter-spacing:.06em}
  .gs-nav-sub{display:none}
  .gs-links a{padding:7px 10px;font-size:10px}
  .gs-switch button{padding:7px 12px}
  /* Less space above the figure, and a smaller plate margin. */
  .iso-page{margin:14px auto 40px}
  .iso-plate{padding:44px 12px 58px}
  .iso-figure{margin:18px 0 22px}
  .gs-cards{grid-template-columns:1fr}
}
@media (max-width:380px){
  .iso-page{margin:10px auto 32px}
  .iso-plate{padding:40px 8px 54px}
  .gs-nav{gap:6px 8px}
  .gs-nav-title{font-size:11px}
  .gs-switch button{padding:6px 9px;font-size:10px}
  .gs-links a{padding:6px 8px}
}

/* ---- landing page ---- */
.gs-lead{max-width:54ch;margin:4px 0 20px;font-size:15px;line-height:1.65}
.gs-lead strong{color:var(--anatomy-strong);font-weight:600}
.gs-hero{margin:0;background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-mid)}
.gs-hero svg{display:block;width:100%;height:auto}
.gs-hero-cap{display:block;margin:9px 0 26px;color:var(--anatomy-muted);font:11px/1.5 var(--anatomy-mono);letter-spacing:.05em;text-transform:uppercase}
.gs-legend{display:flex;flex-wrap:wrap;gap:7px 20px;margin:0 0 30px;color:var(--anatomy-muted);font-size:13px}
.gs-legend span{display:inline-flex;align-items:center;gap:8px}
.gs-dot{width:9px;height:9px;border-radius:50%;flex:none}
.gs-dot[data-c="blue"]{background:var(--anatomy-blue)}
.gs-dot[data-c="amber"]{background:var(--gs-amber)}
.gs-dot[data-c="green"]{background:var(--anatomy-green)}
.gs-dot[data-c="red"]{background:var(--anatomy-red)}
.gs-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:12px;margin:0 0 34px;padding:0;list-style:none}
.gs-card{display:block;padding:15px 16px 16px;background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-lo);text-decoration:none;color:inherit;transition:box-shadow .18s var(--anatomy-ease),transform .18s var(--anatomy-ease)}
.gs-card:hover{box-shadow:0 0 0 1px var(--anatomy-mid);transform:translateY(-1px)}
.gs-card:focus-visible{outline:2px solid var(--anatomy-lit);outline-offset:2px}
.gs-card-top{display:flex;align-items:baseline;gap:9px;margin-bottom:6px}
.gs-fig{font:11px/1 var(--anatomy-mono);letter-spacing:.08em;color:var(--anatomy-muted)}
.gs-card-name{font:600 14px/1.2 ui-sans-serif,system-ui,sans-serif;color:var(--anatomy-strong)}
.gs-card-obj{display:block;font:11px/1.4 var(--anatomy-mono);letter-spacing:.03em;color:var(--gs-amber);margin-bottom:8px}
.gs-card-idea{margin:0;font-size:13px;line-height:1.55}
.gs-foot{display:flex;flex-wrap:wrap;gap:7px 20px;margin-top:6px;padding-top:16px;border-top:1px solid var(--anatomy-lo);color:var(--anatomy-muted);font-size:12.5px}
.gs-foot a{color:var(--anatomy-text)}

/* ---- rendered documents ---- */
.gs-doc{max-width:68ch}
.gs-doc h1{font-size:21px;line-height:1.3;color:var(--anatomy-strong);margin:2px 0 16px}
.gs-doc h2{font-family:var(--anatomy-mono);font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--anatomy-muted);margin:28px 0 9px}
.gs-doc p{margin:0 0 12px;line-height:1.7}
.gs-doc ol{margin:0 0 14px;padding-left:1.35em}
.gs-doc li{margin:0 0 6px;line-height:1.65}
.gs-doc code{font-family:var(--anatomy-mono);font-size:.9em;color:var(--anatomy-strong);background:var(--anatomy-face);padding:1px 5px}
.gs-doc a{color:var(--anatomy-blue)}
.gs-doc table{border-collapse:collapse;margin:0 0 18px;font-size:13px}
.gs-doc th,.gs-doc td{text-align:left;padding:7px 14px 7px 0;border-bottom:1px solid var(--anatomy-lo);vertical-align:top}
.gs-doc th{font-family:var(--anatomy-mono);font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--anatomy-muted)}
.gs-doc-back{display:inline-block;margin-bottom:4px;font:11px/1 var(--anatomy-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--anatomy-muted);text-decoration:none}
.gs-doc-back:hover{color:var(--anatomy-text)}
`;

// `current` is the key of the figure this page is; the theme switch follows the
// reader's saved preference so every page opens in the theme they last chose.
export const FIGURES = [
  { key: "home", label: "Home", href: "index.html", alt: "index.html" },
  { key: "staging", label: "Staging", href: "staging-light.html", alt: "staging.html" },
  { key: "switchyard", label: "Branch & merge", href: "git-switchyard-light.html", alt: "git-switchyard.html" },
  { key: "clone", label: "Clone", href: "clone-light.html", alt: "clone.html" },
  { key: "remotes", label: "Remotes", href: "remotes-light.html", alt: "remotes.html" },
  { key: "conflicts", label: "Conflicts", href: "conflicts-light.html", alt: "conflicts.html" },
  { key: "rebase", label: "Rebase", href: "rebase-light.html", alt: "rebase.html" },
  { key: "pr", label: "Pull request", href: "pull-request-light.html", alt: "pull-request.html" },
  { key: "tags", label: "Tags", href: "tags-light.html", alt: "tags.html" },
];

export function navHtml(current, title, sub, base = "") {
  const links = FIGURES.map((f) => {
    const here = f.key === current ? ' aria-current="page"' : "";
    return `<a href="${base}${f.href}"${here}>${f.label}</a>`;
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
