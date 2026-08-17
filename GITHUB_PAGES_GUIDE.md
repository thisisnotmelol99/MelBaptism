# Baptism Invitation GitHub Pages Guide

This invitation is a static website. Visitors can view it, open the animated invitation, click directions, open the RSVP form, and browse the photos, but they cannot edit the published site.

## Files

- `index.html` is the invitation page.
- `styles.css` controls the classic gold styling and layout.
- `script.js` stores the editable invitation text.
- `rsvp.html` is the RSVP form page.
- `rsvp.js` sends RSVP submissions to your chosen endpoint.
- `images/` holds the background art and Melinoe's photos.

## Editing The Invitation

1. Open `index.html` in your browser.
2. Add `?edit=1` to the end of the address.
3. Example local address: `index.html?edit=1`.
4. Update the text in the editor panel.
5. Click `Copy Saved Data`.
6. Open `script.js`.
7. Find the block that starts with `const defaults = {`.
8. Replace the whole object, from `{` through the matching `}`, with your copied data.

The current date and time are placeholders because they were not provided yet, so you should update those before publishing.

## RSVP Storage

The RSVP page is already built, but GitHub Pages cannot store form submissions by itself.

Your response sheet is:

`https://docs.google.com/spreadsheets/d/1AQc45OvlTVjf67y8ygLsjK6eE8tf1qIknn-o8iasG7o/edit?usp=sharing`

To make guest responses save into that sheet, set `RSVP_ENDPOINT` inside `rsvp.js` to a working form receiver URL. That receiver can point to:

- A Google Apps Script that writes into a Google Sheet
- A hosted form service that stores submissions in a table
- Any endpoint that accepts JSON and saves the response list

Once connected, each RSVP submission includes:

- Guest name
- Contact details
- Attendance status
- Whether they are bringing someone else
- Additional guest count
- Guest names
- Optional message

That lets you keep a raw response list and calculate total headcount from `totalPartySize`.

## GitHub Pages

1. Create a GitHub repository.
2. Upload everything inside this `baptism-invitation` folder.
3. Commit the files.
4. Open the repository `Settings`.
5. Open `Pages`.
6. Set Source to `Deploy from a branch`.
7. Choose branch `main` and folder `/root`.
8. Save.

After GitHub finishes publishing, your website address will look like:

`https://YOUR-GITHUB-USERNAME.github.io/REPOSITORY-NAME/`

## Notes

- The page is locked to the Classic Gold theme.
- The guest RSVP page is `rsvp.html`.
- Guests should receive the normal invitation link, not the `?edit=1` version.
