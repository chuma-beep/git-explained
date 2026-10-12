# Clone, and tracking branches

Figure 3 shows a mill that makes copies.
The high row is the server.
The low row is your clone.
The mill is `git clone`.

## What clone copies

`git clone` copies the whole history.
A clone is not only the files of the last commit.
A clone holds every commit of the project.

Your clone is a full repository.
You can make commits in your clone with no network connection.

## The two names that clone adds

A clone adds the name `origin`.
`origin` is a short name for the server.

A clone also adds `origin/main`.
`origin/main` is a bookmark of where the server was at the time of the clone.

You have your own `main` as well.
`main` is your branch.
`origin/main` is the last position of the server that you saw.

## The two arms

The board holds two arms.
The `main` arm is the position of your branch.
The `origin/main` arm is the position of the server that you last saw.

The two arms start at the same place after a clone.
The arms move apart when you commit.
A commit moves your `main` arm only.

`git fetch` and `git push` move the `origin/main` arm.

## The important rule

`origin/main` is not the true position of the server.
`origin/main` is the position of the server when you last spoke to it.

## Use the figure

1. Click the figure, or press the `c` key, to clone the row.
2. The mill stamps each commit onto your bench.
3. The two arms sit at the same commit after the clone.
