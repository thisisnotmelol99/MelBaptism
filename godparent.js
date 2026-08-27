const inviteVideos = {
    ninang: {
        heading: "A heartfelt invitation to be a Ninang",
        copy: "With love and gratitude, Mark Aris Almase and Jovel Edria Almase would be honored to invite you to stand as Ninang for Melinoe Zyla Edria Almase.",
        video: "images/Ninang.mp4"
    },
    ninong: {
        heading: "A heartfelt invitation to be a Ninong",
        copy: "With love and gratitude, Mark Aris Almase and Jovel Edria Almase would be honored to invite you to stand as Ninong for Melinoe Zyla Edria Almase.",
        video: "images/Ninong.mp4"
    }
};

function getInviteType() {
    const params = new URLSearchParams(window.location.search);
    const type = String(params.get("type") || "").trim().toLowerCase();
    return inviteVideos[type] ? type : "ninong";
}

function hydrateInvitePage() {
    const inviteType = getInviteType();
    const config = inviteVideos[inviteType];
    const heading = document.querySelector("[data-invite-heading]");
    const copy = document.querySelector("[data-invite-copy]");
    const video = document.querySelector("[data-invite-video]");
    const source = video ? video.querySelector("source") : null;
    const acceptLink = document.querySelector("[data-accept-link]");

    if (heading) {
        heading.textContent = config.heading;
    }

    if (copy) {
        copy.textContent = config.copy;
    }

    if (source) {
        source.src = config.video;
        video.load();
    }

    if (acceptLink) {
        acceptLink.href = `godparent-form.html?type=${inviteType}`;
    }
}

hydrateInvitePage();
