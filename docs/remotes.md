# Remotes

Figure 2 shows a goods yard with 2 bays.
The near bay is your repository.
The far bay is the remote repository.
The remote is also called `origin`.

A remote is a copy of the repository on a different computer.
The copy has its own branches and its own commits.

## The gantry

The gantry moves a wagon between the bays.
The gantry is the network connection.
A wagon that exists in both bays is in the figure 2 times.
This is important.
The remote does not point to your wagon.
The remote has its own copy.

## Push

`git push` sends your commits to the remote.
Push copies the commits that the remote does not have.
Push does not remove the commits from your repository.

In Figure 2, press the `p` key.
The gantry moves the wagon C to the far bay.
The commit C is then in both bays.

## Fetch

`git fetch` gets the new commits from the remote.
Fetch puts the commits in your repository.
Fetch does not change your branch.
Fetch does not change your files.

## Pull

`git pull` is a fetch and then a merge.
Pull gets the new commits.
Pull then puts them on your branch.

In Figure 2, press the `l` key.
The gantry moves the wagon D to the near bay.

## The difference

| Command | Gets commits | Changes your branch |
|---|---|---|
| `git fetch` | yes | no |
| `git pull` | yes | yes |
| `git push` | no | no |
