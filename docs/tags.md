# Tags

Figure 8 shows a press over one road.
The road holds the commits in order.
The brass plate is a tag.
The press rivets the plate onto one commit.

## What a tag is

A tag is a name for one commit.
The name does not move.
A tag stays on its commit for ever.

## A tag and a branch are different

A branch name moves when you commit.
The `main` branch points to the last commit of the road.
The branch moves forward with each new commit.

A tag does not move.
`git tag v1.0` fixes the name `v1.0` to one commit.
A later commit does not change the tag.

## Why this is important

A release has a tag.
The name `v1.0` must always mean the same code.
A branch name cannot give this guarantee, because a branch moves.

## Two types

A light tag is only a name for a commit.
An annotated tag is a full object with its own message and date.

Use an annotated tag for a release.

## Use the figure

1. Click the figure, or press the `t` key, to rivet the tag onto c3.
2. Look at the plate on the wagon.
3. A new commit, c4, then joins the road.

The pointer moves to c4.
The plate stays on c3.
