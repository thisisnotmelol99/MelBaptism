const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbztuMC_kk9kF6PDIg8BWIYCsnOAgZbw7cm1dm3e25wcsWpRFlqJPFWHQBw-Wy0rr6-LVQ/exec";
const RSVP_SHEET_URL = "https://docs.google.com/spreadsheets/d/1AQc45OvlTVjf67y8ygLsjK6eE8tf1qIknn-o8iasG7o/edit?usp=sharing";

function serializeForm(form) {
    const data = new FormData(form);
    const attendance = data.get("attendance");
    const bringingGuests = data.get("bringingGuests");
    const guestCount = bringingGuests === "Yes"
        ? Math.max(1, Number(data.get("guestCount") || 1))
        : 0;

    return {
        submittedAt: new Date().toISOString(),
        fullName: String(data.get("fullName") || "").trim(),
        contactInfo: String(data.get("contactInfo") || "").trim(),
        attendance: String(attendance || "").trim(),
        bringingGuests: String(bringingGuests || "").trim(),
        guestCount,
        totalPartySize: attendance === "Attending" ? guestCount + 1 : 0,
        guestNames: String(data.get("guestNames") || "").trim(),
        message: String(data.get("message") || "").trim()
    };
}

function updateGuestFields() {
    const toggle = document.querySelector("[data-guest-toggle]");
    const guestFields = document.querySelectorAll("[data-guest-field]");
    const isVisible = toggle.value === "Yes";

    guestFields.forEach((field) => {
        field.classList.toggle("hidden-field", !isVisible);
    });
}

async function submitRsvp(payload) {
    const response = await fetch(RSVP_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error("Submission failed.");
    }
}

function bindForm() {
    const form = document.querySelector("[data-rsvp-form]");
    const statusText = document.querySelector("[data-status-text]");
    const toggle = document.querySelector("[data-guest-toggle]");

    if (!form || !statusText || !toggle) {
        return;
    }

    toggle.addEventListener("change", updateGuestFields);
    updateGuestFields();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const payload = serializeForm(form);

        if (!RSVP_ENDPOINT) {
            statusText.innerHTML = `The RSVP form is ready, but the submission endpoint is not connected yet. Responses are meant to go to your Google Sheet: <a href="${RSVP_SHEET_URL}" target="_blank" rel="noreferrer">open sheet</a>. Add the Apps Script or form endpoint in rsvp.js to start saving submissions there.`;
            return;
        }

        statusText.textContent = "Submitting RSVP...";

        try {
            await submitRsvp(payload);
            form.reset();
            updateGuestFields();
            statusText.textContent = "Thank you. Your RSVP has been submitted.";
        } catch {
            statusText.textContent = "Something went wrong while sending the RSVP. Please try again or message Aris or Jovel in Messenger.";
        }
    });
}

bindForm();
