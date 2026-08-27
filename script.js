const defaults = {
    childName: "Melinoe Zyla Edria Almase",
    parents: "Mark Aris Almase and Jovel Edria Almase",
    date: "December 12, 2026",
    time: "9:30 AM, please arrive at least 30 minutes before the ceremony.",
    church: "Sto. Nino Parish de Cebu",
    reception: "Kenny Rogers Southwoods",
    receptionAddress: "Block 2, Lot 2, Southwoods Ecocentrum Business Park, Ecocentrum Blvd, City of Bi\u00f1an, Laguna",
    rsvp: "Please RSVP using the form so we can keep an accurate guest list and headcount.",
    attireNote: "We would love for everyone to come in neat church attire with a graceful, celebratory feel. Soft neutrals, warm beige, champagne, cream, and gentle earth tones are warmly encouraged, while very casual wear and loud prints are best avoided.",
    contactNote: "Please RSVP through the form. For any questions or clarifications, message Aris or Jovel in Messenger.",
    blessingNote: "Your presence and prayers are more than enough. If you would also like to bless Melinoe with a monetary gift, you may use the QR codes below.",
    giftNote: "Thank you for celebrating this meaningful day with our family. We will clear the RSVP list after the event.",
    godparents: "To be announced",
    ceremonyLink: "https://www.google.com/maps/search/?api=1&query=Sto.+Nino+Parish+de+Cebu",
    receptionLink: "https://www.google.com/maps/search/?api=1&query=Kenny+Rogers+Southwoods+Block+2+Lot+2+Southwoods+Ecocentrum+Business+Park+Ecocentrum+Blvd+City+of+Bi%C3%B1an+Laguna",
    rsvpLink: "rsvp.html",
    giftQrOne: "images/QR Gotyme.jfif",
    giftQrTwo: "images/QR Vybe.jfif",
    theme: "gold"
};

const storageKey = "baptismInvitationTemplate";
const storageVersion = 2;
const openedKey = "baptismInvitationOpened";
const GODPARENT_ENDPOINT = "https://script.google.com/macros/s/AKfycbztuMC_kk9kF6PDIg8BWIYCsnOAgZbw7cm1dm3e25wcsWpRFlqJPFWHQBw-Wy0rr6-LVQ/exec?type=godparents";
const params = new URLSearchParams(window.location.search);
const canEdit = params.get("edit") === "1";
let confirmedGodparents = [];

function loadState() {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        if (!stored || stored.__version !== storageVersion) {
            return { ...defaults };
        }
        return { ...defaults, ...stored };
    } catch {
        return { ...defaults };
    }
}

function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify({
        ...state,
        __version: storageVersion
    }));
}

let state = loadState();

function renderGodparents() {
    const godparentList = document.querySelector("[data-list='godparents']");
    if (!godparentList) {
        return;
    }

    const names = confirmedGodparents.length > 0
        ? confirmedGodparents
        : state.godparents
            .split("\n")
            .map((name) => name.trim())
            .filter(Boolean);

    godparentList.innerHTML = "";
    names.forEach((name) => {
        const item = document.createElement("span");
        item.textContent = name;
        godparentList.appendChild(item);
    });
}

async function fetchConfirmedGodparents() {
    try {
        const response = await fetch(GODPARENT_ENDPOINT, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            return;
        }

        const payload = await response.json();
        if (!payload || !Array.isArray(payload.godparents)) {
            return;
        }

        confirmedGodparents = payload.godparents
            .map((entry) => String(entry || "").trim())
            .filter(Boolean);
        renderGodparents();
    } catch {
        // Keep the locally configured list when the endpoint is unavailable.
    }
}

function openInvitation(skipAnimation = false) {
    const openingScreen = document.querySelector("[data-opening-screen]");

    document.body.classList.add("invitation-opened");
    sessionStorage.setItem(openedKey, "1");

    if (!openingScreen) {
        return;
    }

    if (skipAnimation) {
        openingScreen.hidden = true;
        return;
    }

    openingScreen.classList.add("is-opening");
    window.setTimeout(() => {
        openingScreen.classList.add("is-open");
    }, 900);
    window.setTimeout(() => {
        openingScreen.hidden = true;
    }, 1650);
}

function render() {
    document.body.dataset.theme = defaults.theme;
    document.title = `${state.childName} Baptism Invitation`;

    document.querySelectorAll("[data-text]").forEach((element) => {
        element.textContent = state[element.dataset.text] || "";
    });

    document.querySelectorAll("[data-link]").forEach((element) => {
        element.href = state[element.dataset.link] || "#";
    });

    const giftMappings = [
        { key: "giftQrOne", slot: "one" },
        { key: "giftQrTwo", slot: "two" }
    ];
    let visibleGiftCards = 0;

    giftMappings.forEach(({ key, slot }) => {
        const card = document.querySelector(`[data-gift-card='${slot}']`);
        const image = document.querySelector(`[data-gift-image='${slot}']`);
        if (!card || !image) {
            return;
        }

        const src = (state[key] || "").trim();
        if (src) {
            image.src = src;
            card.classList.remove("is-hidden");
            visibleGiftCards += 1;
        } else {
            image.removeAttribute("src");
            card.classList.add("is-hidden");
        }
    });

    const giftGrid = document.querySelector("[data-gift-grid]");
    if (giftGrid) {
        giftGrid.classList.toggle("is-hidden", visibleGiftCards === 0);
    }

    renderGodparents();

    document.querySelectorAll("[data-field]").forEach((field) => {
        field.value = state[field.dataset.field] || "";
    });
}

function bindEditor() {
    const openButton = document.querySelector("[data-editor-open]");
    const closeButton = document.querySelector("[data-editor-close]");
    const panel = document.querySelector("[data-editor-panel]");

    if (!canEdit || !openButton || !closeButton || !panel) {
        return;
    }

    openInvitation(true);
    openButton.hidden = false;
    panel.hidden = false;

    openButton.addEventListener("click", () => {
        panel.hidden = false;
    });

    closeButton.addEventListener("click", () => {
        panel.hidden = true;
    });

    document.querySelectorAll("[data-field]").forEach((field) => {
        field.addEventListener("input", () => {
            state[field.dataset.field] = field.value;
            saveState(state);
            render();
        });
    });

    document.querySelector("[data-reset]").addEventListener("click", () => {
        state = { ...defaults };
        saveState(state);
        render();
    });

    document.querySelector("[data-copy-config]").addEventListener("click", async () => {
        const output = JSON.stringify(state, null, 2);
        try {
            await navigator.clipboard.writeText(output);
            alert("Saved invitation data copied to clipboard.");
        } catch {
            prompt("Copy this saved invitation data:", output);
        }
    });
}

function bindOpeningScreen() {
    const openButton = document.querySelector("[data-open-invitation]");

    if (!openButton) {
        return;
    }

    if (canEdit || sessionStorage.getItem(openedKey) === "1") {
        openInvitation(true);
        return;
    }

    openButton.addEventListener("click", () => {
        openInvitation();
    });
}

function revealSections() {
    const sections = document.querySelectorAll("main section");

    if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => section.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach((section) => {
        section.classList.add("reveal");
        observer.observe(section);
    });
}

bindOpeningScreen();
bindEditor();
render();
revealSections();
fetchConfirmedGodparents();
