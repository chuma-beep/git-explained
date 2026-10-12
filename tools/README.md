# tools/ — build and check tools

| File | Origin | Purpose |
|---|---|---|
| `build-all.mjs` | this project | Build every figure, both themes |
| `audit.mjs` | this project | Drive every page in a browser; check motion and line ends |
| `drive.mjs` | anatomy skill, `scripts/drive.mjs` | Headless-browser driver (click, wait, screenshot, line check) |
| `line-ends.mjs` | anatomy skill, `scripts/line-ends.mjs` | The line-end check that `drive.mjs` runs |
| `ste_check.py` | simplified-technical-english skill, `scripts/ste_check.py` | Check text against the STE rules |
| `word-list.md` | simplified-technical-english skill, `references/word-list.md` | The 869 approved words |
| `STE-LICENSE` | simplified-technical-english skill, `LICENSE` | Licence for the STE files |

`drive.mjs` and `line-ends.mjs` come from the [anatomy](https://github.com/wheresryan22/anatomy)
skill, MIT. `ste_check.py` and `word-list.md` come from the
[simplified-technical-english](https://github.com/0xpili/simplified-technical-english)
skill, MIT.

They are copied here so that `npm test` runs on a fresh clone with no other
software installed. To update them, copy the new files from the installed
skills and run `npm test`.

`drive.mjs` needs a browser. It looks at `$CHROME_PATH` first, then the usual
paths. Any Chromium or Chrome works.
