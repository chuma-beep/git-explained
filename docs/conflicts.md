# Conflicts

Figure 5 shows two roads that become one.
The road from `main` brings one wagon.
The road from `feat` brings another wagon.
Both wagons claim the same place.

## What a conflict is

A conflict is not a fault in git.
A conflict is a question that git cannot answer.

A conflict occurs when two branches change the same line of a file.
Git has two answers for one place.
Git cannot choose the right answer.
Git stops and waits for a person.

## The lamp

The lamp is red while the conflict is open.
The red lamp shows that git stopped.

## How to resolve a conflict

1. Open the file that git names.
2. Find the marks that git put in the file.
3. Edit the file to the answer that you want. Remove the marks.
4. `git add` the file.
5. `git commit` the result.

The lamp becomes green when the work is complete.

## The important rule

Git does not resolve a conflict.
A person resolves a conflict.
Git stops, marks the place, and waits.

## Use the figure

1. Click the figure, or press the Space key, to merge the two roads.
2. The two wagons meet at the berth and the lamp becomes red.
3. Click again to rewrite one wagon by hand.
4. The lamp becomes green and both changes stay.
