# Baptism Invitation GitHub Pages Guide

This invitation is a static website. That means visitors can view it, choose a theme, and click links, but they cannot save edits to your published files.

## Files

- `index.html` is the page structure.
- `styles.css` controls the layout and themes.
- `script.js` stores the invitation text and runs the theme/editor behavior.
- `images/baptism-watercolor-hero.png` is the hero background.

## Editing The Invitation

1. Open `index.html` in your browser.
2. To show the owner editor, add `?edit=1` to the end of the address.
3. Example local address: `index.html?edit=1`.
4. Change the names, date, time, places, RSVP note, links, and godparents.
5. Click `Copy Saved Data`.
6. Open `script.js`.
7. Find the first block that starts with `const defaults = {`.
8. Replace the whole object, from `{` through the matching `}`, with your copied data.
9. Save the file.

Your guests should receive the normal page link without `?edit=1`.

## Creating It On GitHub

1. Create a GitHub account at `github.com`.
2. Click the `+` button in the top-right corner.
3. Choose `New repository`.
4. Name it something like `baptism-invitation`.
5. Set it to `Public`.
6. Click `Create repository`.
7. Click `uploading an existing file`.
8. Drag in everything inside this `baptism-invitation` folder.
9. Click `Commit changes`.
10. Go to `Settings`.
11. Go to `Pages`.
12. Under `Build and deployment`, choose:
    - Source: `Deploy from a branch`
    - Branch: `main`
    - Folder: `/root`
13. Click `Save`.

GitHub will show your website link after a short wait. It will look like:

`https://YOUR-GITHUB-USERNAME.github.io/baptism-invitation/`

## Updating Later

1. Go to your repository on GitHub.
2. Click the file you want to change, usually `script.js`.
3. Click the pencil icon.
4. Edit the text.
5. Click `Commit changes`.
6. Wait a minute for GitHub Pages to refresh.

## Theme Options

Guests can use the theme bar at the top of the page:

- Blush Garden
- Sage Chapel
- Sky Grace
- Classic Gold

The selected theme is saved only in that person's browser.
