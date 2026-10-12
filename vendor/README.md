# vendor/ — the anatomy isometric kit

These files are copied from the [anatomy](https://github.com/wheresryan22/anatomy)
skill, which the figures are drawn with. The copy makes this repository
self-contained: a fresh clone builds and rebuilds with nothing else installed.

| File | Origin |
|---|---|
| `iso-kit.mjs` | `kit/iso-kit.mjs` |
| `inline-kit.mjs` | a reduced copy of `scripts/inline-kit.mjs`, holding only `kitScript()` |
| `LICENSE` | the anatomy licence, MIT, Copyright (c) 2026 Ryan |

`iso-kit.mjs` has no imports, so it stands alone.

## To update the kit

Copy the new files from an installed skill:

```sh
SKILL=~/.config/opencode/skills/anatomy   # or your $ANATOMY_SKILL
cp "$SKILL/kit/iso-kit.mjs" vendor/iso-kit.mjs
cp "$SKILL/LICENSE" vendor/LICENSE
npm run build                              # confirm nothing broke
```

Then read the built pages and run the line-end audit before you commit.

## If you remove this directory

`figure-kit.mjs` falls back to an installed anatomy skill, and looks in
`$ANATOMY_SKILL`, `~/.config/opencode/skills/anatomy`, and
`~/.claude/skills/anatomy`. With no vendor/ and no installed skill, the build
stops and prints the paths it tried.
