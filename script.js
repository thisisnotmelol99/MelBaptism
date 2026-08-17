const defaults = {
    childName: "Angelie De Leon",
    parents: "Haison and Melody De Leon",
    date: "Sunday, December 22, 2024",
    time: "10:00 AM",
    church: "St. Therese of the Child Jesus Parish, Los Banos",
    reception: "The Grove, Los Banos",
    rsvp: "Kindly confirm your attendance by December 15, 2024. You may contact Haison or Melody directly.",
    godparents: "Ninong H\nNinang M",
    ceremonyLink: "https://www.google.com/maps/dir/?api=1&destination=St.+Therese+of+the+Child+Jesus+Parish,+Los+Banos,+Laguna",
    receptionLink: "https://www.google.com/maps/dir/?api=1&destination=The+Grove+Los+Banos,+Laguna",
    theme: "blush"
};

const storageKey = "baptismInvitationTemplate";
const params = new URLSearchParams(window.location.search);
const canEdit = params.get("edit") === "1";

function loadState() {
    try {
        return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey)) };
    } catch {
        return { ...defaults };
    }
}

function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
}

let state = loadState();

function render() {
    document.body.dataset.theme = state.theme;
    document.title = `${state.childName} Baptism Invitation`;

    document.querySelectorAll("[data-text]").forEach((element) => {
        element.textContent = state[element.dataset.text] || "";
    });

    document.querySelectorAll("[data-link]").forEach((element) => {
        element.href = state[element.dataset.link] || "#";
    });

    const godparentList = document.querySelector("[data-list='godparents']");
    godparentList.innerHTML = "";
    state.godparents
        .split("\n")
        .map((name) => name.trim())
        .filter(Boolean)
        .forEach((name) => {
            const item = document.createElement("span");
            item.textContent = name;
            godparentList.appendChild(item);
        });

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.themeChoice === state.theme);
    });

    document.querySelectorAll("[data-field]").forEach((field) => {
        field.value = state[field.dataset.field] || "";
    });
}

function bindThemeControls() {
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
        button.addEventListener("click", () => {
            state.theme = button.dataset.themeChoice;
            saveState(state);
            render();
        });
    });
}

function bindEditor() {
    const openButton = document.querySelector("[data-editor-open]");
    const closeButton = document.querySelector("[data-editor-close]");
    const panel = document.querySelector("[data-editor-panel]");

    if (!canEdit) {
        return;
    }

    openButton.hidden = false;
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

bindThemeControls();
bindEditor();
render();
revealSections();
