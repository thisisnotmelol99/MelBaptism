# Baptism Invitation GitHub Pages Guide

This invitation is a static website. Visitors can view it, open the animated invitation, click directions, open the RSVP form, and browse the photos, but they cannot edit the published site.

## Files

- `index.html` is the invitation page.
- `styles.css` controls the classic gold styling and layout.
- `script.js` stores the editable invitation text.
- `rsvp.html` is the RSVP form page.
- `rsvp.js` sends RSVP submissions to your chosen endpoint.
- `godparent.html` is the separate godparent invitation page.
- `godparent.js` powers the Ninong or Ninang video invitation page.
- `godparent-form.html` is the confirmation form page after the invitee accepts.
- `godparent-form.js` sends godparent confirmations to your chosen endpoint.
- `godparent-confirmation.html` is the thank-you page after a godparent responds.
- `images/` holds the background art, Melinoe's photos, and the godparent invite videos.

## Editing The Invitation

1. Open `index.html` in your browser.
2. Add `?edit=1` to the end of the address.
3. Example local address: `index.html?edit=1`.
4. Update the text in the editor panel.
5. Click `Copy Saved Data`.
6. Open `script.js`.
7. Find the block that starts with `const defaults = {`.
8. Replace the whole object, from `{` through the matching `}`, with your copied data.

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

## Godparent Confirmation Storage

The godparent invitation page uses the same Apps Script endpoint, but it sends a different payload so your script can store it in a separate tab or filter it cleanly.

Each godparent confirmation sends:

- `formType` as `godparent`
- `submittedAt`
- `invitedName`
- `fullName`
- `contactInfo`
- `attendance`
- `role`
- `message`

To make the main invitation page auto-fill the godparents list from confirmed responses, your Apps Script should also support:

- `GET .../exec?type=godparents`

That request should return JSON in this shape:

```json
{
  "godparents": [
    "Sample Ninang",
    "Sample Ninong"
  ]
}
```

Only include the names of people who accepted the invitation. The main page already reads that response and shows those names automatically.

## Sending A Godparent Link

You can now send one shared video invitation link per role:

- `godparent.html?type=ninong`
- `godparent.html?type=ninang`

Each link opens the matching invite video first. If the guest accepts, they are taken to the form page and can send their confirmation there. Once your Apps Script returns the confirmed list, the public invitation page updates the displayed godparents automatically.

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
