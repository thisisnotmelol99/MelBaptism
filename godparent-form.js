const GODPARENT_POST_ENDPOINT = "https://script.google.com/macros/s/AKfycbztuMC_kk9kF6PDIg8BWIYCsnOAgZbw7cm1dm3e25wcsWpRFlqJPFWHQBw-Wy0rr6-LVQ/exec";

const inviteCopy = {
    ninang: {
        heading: "Confirm your Ninang invitation",
        copy: "Please complete the form below so the family can receive your response and update the godparents list."
    },
    ninong: {
        heading: "Confirm your Ninong invitation",
        copy: "Please complete the form below so the family can receive your response and update the godparents list."
    }
};

function getInviteType() {
    const params = new URLSearchParams(window.location.search);
    const type = String(params.get("type") || "").trim().toLowerCase();
    return inviteCopy[type] ? type : "ninong";
}

function hydrateFormPage() {
    const inviteType = getInviteType();
    const config = inviteCopy[inviteType];
    const heading = document.querySelector("[data-form-heading]");
    const copy = document.querySelector("[data-form-copy]");
    const backLink = document.querySelector("[data-back-link]");

    if (heading) {
        heading.textContent = config.heading;
    }

    if (copy) {
        copy.textContent = config.copy;
    }

    if (backLink) {
        backLink.href = `godparent.html?type=${inviteType}`;
    }
}

function serializeGodparentForm(form) {
    const data = new FormData(form);

    return {
        formType: "godparent",
        submittedAt: new Date().toISOString(),
        invitedName: "",
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
            nextUrl.searchParams.set("status", payload.attendance);
            nextUrl.searchParams.set("type", getInviteType());
            nextUrl.searchParams.set("name", payload.fullName);
            window.location.href = nextUrl.toString();
        } catch {
            statusText.textContent = "Something went wrong while sending the confirmation. Please try again or message Aris or Jovel in Messenger.";
        }
    });
}

hydrateFormPage();
bindGodparentForm();
