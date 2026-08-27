const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbztuMC_kk9kF6PDIg8BWIYCsnOAgZbw7cm1dm3e25wcsWpRFlqJPFWHQBw-Wy0rr6-LVQ/exec";
const RSVP_SHEET_URL = "https://docs.google.com/spreadsheets/d/1AQc45OvlTVjf67y8ygLsjK6eE8tf1qIknn-o8iasG7o/edit?usp=sharing";
const RSVP_CSV_URL = "https://docs.google.com/spreadsheets/d/1AQc45OvlTVjf67y8ygLsjK6eE8tf1qIknn-o8iasG7o/export?format=csv&gid=0";
const MAX_PAX = 50;

let latestCapacity = null;

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
    try {
        const currentHeadcount = await getCurrentHeadcount();
        const remaining = Math.max(0, MAX_PAX - currentHeadcount);
        latestCapacity = { currentHeadcount, remaining };
        if (statusText) {
            statusText.textContent = "";
        }
        return latestCapacity;
    } catch {
        latestCapacity = null;
        if (statusText) {
            statusText.textContent = "";
        }
        return null;
    }
}

function updateSubmitAvailability(form, statusText) {
    const submitButton = form.querySelector("[data-submit-rsvp]");
    if (!submitButton) {
        return;
    }

    const payload = serializeForm(form);
    const hasCapacityLimit = payload.totalPartySize > MAX_PAX;
    const hasLiveCapacityConflict = Boolean(
        latestCapacity &&
        payload.attendance === "Attending" &&
        payload.totalPartySize > latestCapacity.remaining
    );

    submitButton.disabled = hasCapacityLimit || hasLiveCapacityConflict;

    if (statusText && !submitButton.disabled && statusText.textContent.startsWith("Not enough")) {
        statusText.textContent = "";
    }

    if (statusText && submitButton.disabled && hasLiveCapacityConflict) {
        statusText.textContent = "Not enough slots remain for the selected party size.";
    }

    if (statusText && submitButton.disabled && hasCapacityLimit) {
        statusText.textContent = "Please reduce the number of guests in this RSVP.";
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
    form.addEventListener("input", () => updateSubmitAvailability(form, statusText));
    form.addEventListener("change", () => updateSubmitAvailability(form, statusText));
    updateGuestFields();
    updateSubmitAvailability(form, statusText);
    refreshCapacity(statusText).then(() => updateSubmitAvailability(form, statusText));

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
            statusText.innerHTML = `The RSVP form is not ready right now. Please message Aris or Jovel in Messenger, or check the response sheet here: <a href="${RSVP_SHEET_URL}" target="_blank" rel="noreferrer">open sheet</a>.`;
            return;
        }

        const capacity = await refreshCapacity(statusText);
        updateSubmitAvailability(form, statusText);
        if (capacity && payload.totalPartySize > capacity.remaining) {
            statusText.textContent = "Not enough slots remain for the selected party size.";
            return;
        }

        statusText.textContent = "Submitting RSVP...";

        try {
            await submitRsvp(payload);
            window.location.href = "confirmation.html";
        } catch {
            statusText.textContent = "Something went wrong while sending the RSVP. Please try again or message Aris or Jovel in Messenger.";
        }
    });
}

bindForm();
