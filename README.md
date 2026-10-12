<h1 align="center">Git, explained as a working machine</h1>

<p align="center">
  <b>Eight interactive figures that explain git and GitHub by building them as real objects.</b><br>
  Every commit is a wagon, every branch is a road, and the concepts are the mechanism of a rail yard rather than boxes-and-arrows.
</p>

<p align="center">
  <a href="https://chuma-beep.github.io/git-explained/"><img src="https://img.shields.io/badge/open_the_figures-live-1b1b19?style=flat-square" alt="Open the figures"></a>
  <a href="https://github.com/chuma-beep/git-explained/actions/workflows/ci.yml"><img src="https://github.com/chuma-beep/git-explained/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/licence-MIT-1b1b19?style=flat-square" alt="MIT licence"></a>
</p>

**Open them here: <https://chuma-beep.github.io/git-explained/>**

Built with the [anatomy](https://github.com/wheresryan22/anatomy) skill, which
draws isometric SVG from a single Node build script and no framework.

## The figures

Open `index.html`, or any of the linked pages. Each is standalone and works
from the filesystem — no server needed.

| Page | Object | The idea |
|---|---|---|
| [`staging.html`](staging.html) | **Packing bench** — bench, tray, press | The three areas. You edit on the bench (working directory), `git add` moves a change to the tray (staging area), and `git commit` seals the tray into a crate on the rack. A change left on the bench is not in the commit, however often you save the file. |
| [`index.html`](index.html) | **Switchyard** — a signal-box junction | Commits are wagons, branches are roads. `main` runs A‑B‑C‑F, `feat` leaves the line exactly where B stands and runs D‑E, and F is a merge commit with two parents. HEAD rides the rails. |
| [`clone.html`](clone.html) | **Mill that makes copies** | `git clone` copies the whole history, not just the files, and adds `origin` and `origin/main`. Two arms on a board show your branch and the server as you last saw it. |
| [`remotes.html`](remotes.html) | **Goods yard with two bays** | A remote is not a cloud, it is another copy of your wagons. `push` lifts a wagon to the far bay, `fetch` downloads without merging, `pull` also puts it on your road. |
| [`conflicts.html`](conflicts.html) | **Two roads into one berth** | A conflict is not a git fault. Two branches change the same line, so git has two answers for one place and stops. A lamp is red until a person edits the file; then it is green. |
| [`rebase.html`](rebase.html) | **Permanent-way gantry over two beds** | Rebase does not merge. It lifts D and E off the old base and replays them on B, so they return as D′ and E′ — same changes, new commit ids, straight history, no merge commit. |
| [`pull-request.html`](pull-request.html) | **Goods gate with a review lamp** | A pull request is a gate, not a move. D and E cannot reach `main` on their own: the barrier is down until a reviewer clears it, then they run through and M appears with two parents. |
| [`tags.html`](tags.html) | **Plate press on one road** | A branch name moves when you commit; a tag does not. `git tag v1.0` rivets a plate to one commit and leaves it there, which is why a release is a tag. |

Read them in that order. Figure 1 is the one to start with.

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
| [staging.md](docs/staging.md) | The working directory, the staging area, and the commit |
| [branch-and-merge.md](docs/branch-and-merge.md) | Commits, branches, and merges |
| [clone.md](docs/clone.md) | Clone, and tracking branches |
| [remotes.md](docs/remotes.md) | Push, fetch, and pull |
| [conflicts.md](docs/conflicts.md) | Conflicts, and how to resolve them |
| [rebase.md](docs/rebase.md) | Rebase |
| [pull-request.md](docs/pull-request.md) | Pull requests |
| [tags.md](docs/tags.md) | Tags |

Check the documents with the STE tool:

```sh
python3 ~/.claude/skills/simplified-technical-english/scripts/ste_check.py --mode mixed docs/*.md
```

## Colour

The figures share one small colour language, so the same thing is the same
colour on every page:

| Colour | Meaning |
|---|---|
| **Blue** | The other branch, the remote, `origin` |
| **Amber** | Yours: your branch, your bay, `HEAD`, a tag |
| **Green** | Committed, merged, resolved, clear to go |
| **Red** | Stopped: a conflict, a failed check |

So in the switchyard the `feat` siding is blue and the merge commit is green;
in remotes your bay is amber and `origin` is blue; in conflicts the two
approaches are amber and blue and the berth turns green when the clash clears.

Only the top face of a solid is tinted, so the kit's four-tone shading still
reads underneath. Cables animate while they work, using the kit's own flow
lines.

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
npm run build     # every figure, both themes
npm test          # build, then check the figures and the docs
npm run dev       # rebuild on change, served by vite with live reload
npm run watch     # rebuild on change, no server
npm run vendor    # refresh vendor/ from an installed anatomy skill
```

Each figure is one build script and writes a standalone HTML file:

| Script | Writes |
|---|---|
| `build.mjs` | `git-switchyard.html`, `index.html` |
| `build-remotes.mjs` | `remotes.html` |
| `build-rebase.mjs` | `rebase.html` |
| `build-pull-request.mjs` | `pull-request.html` |

`--light` produces the light build of each. `tools/build-all.mjs` finds the
build scripts, so a new figure needs no change to the scripts. `nav.mjs` holds
the shared nav and theme switch, so a change there updates every page at once.

The kit is copied into `vendor/`, so **a clone builds with nothing else
installed**. `figure-kit.mjs` falls back to an installed anatomy skill if
`vendor/` is absent. See [`vendor/README.md`](vendor/README.md).

## Testing

`npm test` builds every figure, then:

- **motion** — opens each page in a real browser and makes sure the figure
  changes on its own. A throw inside `requestAnimationFrame` freezes a figure
  with no error anywhere, so this is the check that catches it.
- **line ends** — every texture line must end on a stroke, a dot or an outline.
- **docs** — every document must pass the Simplified Technical English checker.

The browser is Chromium, or any Chrome on `$CHROME_PATH`. The check tools are
in `tools/`; `tools/README.md` gives their origin.

## Truth

The captions only claim what the drawing actually shows. The switchyard's
siding leaves the main line at the exact position of commit B, because the
caption says `feat` branches off B; and the pointer board holds `main` at F
and `feat` at E, because that is where the pointers actually sit.

## Licence

The figure code is yours to use. The anatomy skill it depends on is MIT.