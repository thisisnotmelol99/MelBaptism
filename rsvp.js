const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbztuMC_kk9kF6PDIg8BWIYCsnOAgZbw7cm1dm3e25wcsWpRFlqJPFWHQBw-Wy0rr6-LVQ/exec";
const RSVP_SHEET_URL = "https://docs.google.com/spreadsheets/d/1AQc45OvlTVjf67y8ygLsjK6eE8tf1qIknn-o8iasG7o/edit?usp=sharing";
const RSVP_CSV_URL = "https://docs.google.com/spreadsheets/d/1AQc45OvlTVjf67y8ygLsjK6eE8tf1qIknn-o8iasG7o/export?format=csv&gid=0";
const MAX_PAX = 40;

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
    await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });
}

async function getCurrentHeadcount() {
    const response = await fetch(RSVP_CSV_URL, {
        method: "GET",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Unable to read sheet.");
    }

    const csv = await response.text();
    const rows = csv.trim().split(/\r?\n/).slice(1);

    return rows.reduce((total, row) => {
        const columns = row.split(",");
        const rawCount = Number(columns[6]);
        return total + (Number.isFinite(rawCount) ? rawCount : 0);
    }, 0);
}

async function refreshCapacity(statusText) {
    const capacityText = document.querySelector("[data-capacity-text]");
    if (!capacityText) {
        return null;
    }

    try {
        const currentHeadcount = await getCurrentHeadcount();
        const remaining = Math.max(0, MAX_PAX - currentHeadcount);
        capacityText.textContent = `Guest list capacity: ${currentHeadcount}/${MAX_PAX} pax confirmed. ${remaining} slot${remaining === 1 ? "" : "s"} remaining.`;
        return { currentHeadcount, remaining };
    } catch {
        capacityText.textContent = `Guest list capacity: ${MAX_PAX} pax maximum. Live count unavailable right now.`;
        if (statusText) {
            statusText.textContent = "The RSVP endpoint is ready, but the live guest count could not be read from the sheet just now.";
        }
        return null;
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
    refreshCapacity();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const payload = serializeForm(form);
        if (payload.totalPartySize > MAX_PAX) {
            statusText.textContent = `A single RSVP cannot exceed ${MAX_PAX} pax.`;
            return;
        }

        if (!RSVP_ENDPOINT) {
            statusText.innerHTML = `The RSVP form is ready, but the submission endpoint is not connected yet. Responses are meant to go to your Google Sheet: <a href="${RSVP_SHEET_URL}" target="_blank" rel="noreferrer">open sheet</a>. Add the Apps Script or form endpoint in rsvp.js to start saving submissions there.`;
            return;
        }

        const capacity = await refreshCapacity();
        if (capacity && payload.totalPartySize > capacity.remaining) {
            statusText.textContent = `Only ${capacity.remaining} slot${capacity.remaining === 1 ? "" : "s"} remain. Please adjust your RSVP entry.`;
            return;
        }

        statusText.textContent = "Submitting RSVP...";

        try {
            await submitRsvp(payload);
            form.reset();
            updateGuestFields();
            statusText.textContent = "Thank you. Your RSVP has been submitted.";
            await refreshCapacity();
        } catch {
            statusText.textContent = "Something went wrong while sending the RSVP. Please try again or message Aris or Jovel in Messenger.";
        }
    });
}

bindForm();
