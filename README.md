# Git, explained as a working machine

Four interactive figures that explain git by building it as a real object.
Every commit is a wagon, every branch is a road, and the concepts are the
mechanism of a rail yard rather than boxes-and-arrows.

Built with the [anatomy](https://github.com/wheresryan22/anatomy) skill, which
draws isometric SVG from a single Node build script and no framework.

## The figures

Open `index.html`, or any of the linked pages. Each is standalone and works
from the filesystem — no server needed.

| Page | Object | The idea |
|---|---|---|
| [`index.html`](index.html) | **Switchyard** — a signal-box junction | Commits are wagons, branches are roads. `main` runs A‑B‑C‑F, `feat` leaves the line exactly where B stands and runs D‑E, and F is a merge commit with two parents. HEAD rides the rails. |
| [`remotes.html`](remotes.html) | **Goods yard with two bays** | A remote is not a cloud, it is another copy of your wagons. `push` lifts a wagon to the far bay, `fetch` downloads without merging, `pull` also puts it on your road. |
| [`rebase.html`](rebase.html) | **Permanent-way gantry over two beds** | Rebase does not merge. It lifts D and E off the old base and replays them on B, so they return as D′ and E′ — same changes, new commit ids, straight history, no merge commit. |
| [`pull-request.html`](pull-request.html) | **Goods gate with a review lamp** | A pull request is a gate, not a move. D and E cannot reach `main` on their own: the barrier is down until a reviewer clears it, then they run through and M appears with two parents. |

## Who it is for

Both. Beginners get the vocabulary that matters — commits are not copies of
your files, branches are not folders, a remote is not magic, and a merge
commit is a real commit with two parents. Experienced developers get the
consequences: rebase rewrites ids, push copies rather than moves, and fetch is
not pull.

## Written explanation

Each figure has a written counterpart in [`docs/`](docs/index.md), in
Simplified Technical English (ASD-STE100). STE keeps sentences short and uses
one term for one thing, so the text is easy to translate and easy to read in a
second language.

| Document | Figure |
|---|---|
| [branch-and-merge.md](docs/branch-and-merge.md) | Commits, branches, and merges |
| [remotes.md](docs/remotes.md) | Push, fetch, and pull |
| [rebase.md](docs/rebase.md) | Rebase |
| [pull-request.md](docs/pull-request.md) | Pull requests |

Check the documents with the STE tool:

```sh
python3 ~/.claude/skills/simplified-technical-english/scripts/ste_check.py --mode mixed docs/*.md
```

## Interaction

Every figure responds to the pointer and the keyboard, settles when you leave
it, and goes still under `prefers-reduced-motion`. Keys:

- **Switchyard** — arrows step commits, `Home`/`End` jump to the ends
- **Remotes** — `p` push, `l` pull, `f` fetch (or click the desk buttons)
- **Rebase** — `r` rebase
- **Pull request** — `space` or `Enter` clears review

Leave a figure alone and it runs an idle tour. The theme switch in the nav
remembers your choice across all four pages.

## Building

```sh
npm run build     # all four figures, both themes
npm run dev       # rebuild on change, served by vite with live reload
npm run watch     # rebuild on change, no server
```

Each figure is one build script and writes a standalone HTML file:

| Script | Writes |
|---|---|
| `build.mjs` | `git-switchyard.html`, `index.html` |
| `build-remotes.mjs` | `remotes.html` |
| `build-rebase.mjs` | `rebase.html` |
| `build-pull-request.mjs` | `pull-request.html` |

`--light` produces the light build of each. `figure-kit.mjs` locates the
anatomy skill and `nav.mjs` holds the shared nav and theme switch, so a change
to those updates every page at once.

If the skill is not found, set `ANATOMY_SKILL` to the folder holding its
`SKILL.md`:

```sh
ANATOMY_SKILL=~/.config/opencode/skills/anatomy npm run build
```

## Truth

The captions only claim what the drawing actually shows. The switchyard's
siding leaves the main line at the exact position of commit B, because the
caption says `feat` branches off B; and the pointer board holds `main` at F
and `feat` at E, because that is where the pointers actually sit.

## Licence

The figure code is yours to use. The anatomy skill it depends on is MIT.