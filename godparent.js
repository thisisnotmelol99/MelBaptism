const GODPARENT_POST_ENDPOINT = "https://script.google.com/macros/s/AKfycbztuMC_kk9kF6PDIg8BWIYCsnOAgZbw7cm1dm3e25wcsWpRFlqJPFWHQBw-Wy0rr6-LVQ/exec";

function getInviteeName() {
    const params = new URLSearchParams(window.location.search);
    return String(params.get("name") || params.get("to") || "").trim();
}

function hydrateInvitee() {
    const inviteeName = getInviteeName();
    const displayName = inviteeName || "You";
    const badgeName = inviteeName || "Your name here";

    document.querySelectorAll("[data-invitee-name]").forEach((element) => {
        element.textContent = displayName;
    });

    document.querySelectorAll("[data-invitee-name-badge]").forEach((element) => {
        element.textContent = badgeName;
    });

    const nameInput = document.querySelector("input[name='fullName']");
    if (nameInput && inviteeName) {
        nameInput.value = inviteeName;
    }
}

function serializeGodparentForm(form) {
    const data = new FormData(form);

    return {
        formType: "godparent",
        submittedAt: new Date().toISOString(),
        invitedName: getInviteeName(),
        fullName: String(data.get("fullName") || "").trim(),
        contactInfo: String(data.get("contactInfo") || "").trim(),
        attendance: String(data.get("attendance") || "").trim(),
        role: "Godparent",
        message: String(data.get("message") || "").trim()
    };
}

async function submitGodparentConfirmation(payload) {
    await fetch(GODPARENT_POST_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });
}

function bindGodparentForm() {
    const form = document.querySelector("[data-godparent-form]");
    const statusText = document.querySelector("[data-status-text]");

    if (!form || !statusText) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const payload = serializeGodparentForm(form);
        statusText.textContent = "Sending your confirmation...";

        try {
            await submitGodparentConfirmation(payload);
            const nextUrl = new URL("godparent-confirmation.html", window.location.href);
            nextUrl.searchParams.set("name", payload.fullName);
            nextUrl.searchParams.set("status", payload.attendance);
            window.location.href = nextUrl.toString();
        } catch {
            statusText.textContent = "Something went wrong while sending the confirmation. Please try again or message Aris or Jovel in Messenger.";
        }
    });
}

hydrateInvitee();
bindGodparentForm();
