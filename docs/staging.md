# Working directory, staging area, and commit

Figure 1 shows a bench in a workshop.
The bench is the working directory.
The tray is the staging area.
The press is the commit.
The rack is the history.

## The three areas

Git keeps your work in three places.
The working directory holds the files that you edit.
The staging area holds the changes for the next commit.
The history holds the commits that you made.

A change moves from the working directory to the staging area.
Then the change moves from the staging area to the history.

## The bench

The bench holds your changes.
A change on the bench is in your files.
A change on the bench is not in the next commit.

Git knows about a change on the bench.
Git does not include the change in a commit until you add it.

## The tray

`git add` moves a change from the bench to the tray.
The tray is the staging area.
Only the changes in the tray go into the next commit.

Each change has a slot in the tray.
You can add one change and not another.
This is how you commit some of your work and keep the rest.

## The press

`git commit` seals the tray into a crate.
The crate goes on the rack.
The rack is the history of the project.

A commit holds the changes that were in the tray.
A commit does not change after you make it.

## The important rule

The tray is what the next commit takes.
A change on the bench is not in the commit, however often you save the file.

## Use the figure

1. Click the bench, or press the `a` key, to add one change to the tray.
2. Press the `c` key to commit the tray.
3. The press seals the tray into a crate on the rack.

The figure runs on its own if you do not touch it.
A change that is still on the bench stays out of the crate.
