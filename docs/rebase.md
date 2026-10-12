# Rebase

Figure 3 shows 2 rail beds.
The low bed is the old base commit.
The high bed is the new base commit.
The gantry is the rebase operation.

## The operation

Rebase moves your commits to a new base.
Rebase does not merge.
Rebase takes each commit of your branch.
Rebase puts the commit on the new base.
The commit has a new identifier after the rebase.

Figure 3 shows this.
The commits D and E are on the old base A.
After the rebase, D and E are on the new base B.
The new commits have the names D' and E'.

## The new identifiers

Git makes a new commit for each commit of your branch.
The new commit has the same changes.
The new commit has a different parent.
A different parent makes a different identifier.

This is the important point of rebase.
The identifiers of your commits change.

WARNING: Do not rebase a branch that other persons use.
The new identifiers cause problems for the other persons.

## Rebase or merge

Use a merge to keep the history of both branches.
Use a rebase to make a straight history.

A merge makes a merge commit.
A rebase makes no merge commit.

## Use the figure

1. Click the lever, or press the `r` key.
2. The gantry moves the wagon D to the high bed.
3. The gantry moves the wagon E to the high bed.
4. The dashed outline shows the old position of each wagon.

The figure returns to the start after a short time.
