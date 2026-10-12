# Branch and merge

Figure 1 shows a railway switchyard.
The wagons are commits.
The roads are branches.
The junction is a merge.
The trolley is HEAD.

## Commits

A commit is a record of the files at one time.
A commit has an identifier.
Each commit points to its parent commit.
The first commit has no parent.
A commit does not change after you make it.

## Branches

A branch is a name for one commit.
The name `main` points to the last commit on the main road.
You can make a branch from any commit.
The new branch then has its own commits.
The main road keeps its own commits.

Figure 1 shows 2 branches.
The `main` road goes through the commits A, B, C, and F.
The `feat` road leaves the main road at B and goes through D and E.

## HEAD

HEAD is a pointer.
HEAD points to the branch that you use.
When you make a commit, git moves the branch to the new commit.
When you select a different branch, HEAD points to that branch.

In Figure 1, HEAD is the trolley.
The trolley moves along the roads.
The board at the right holds `main` at F and `feat` at E.

## Merges

A merge joins 2 branches.
Git makes a new commit for the merge.
A merge commit has 2 parents.
Figure 1 shows this.
The commit F has the parents C and E.

A merge keeps the history of both branches.

## Use the figure

1. Move the mouse across the figure.
2. The trolley moves to the commit below the mouse.
3. Press the Left Arrow key and the Right Arrow key to go through the commits.
4. Press the Home key and the End key to go to the first commit and the last commit.

The readout at the bottom right shows the current commit and its parent.
