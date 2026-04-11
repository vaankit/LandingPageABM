const form = document.getElementById("generator-form");
const companyUrlInput = document.getElementById("companyUrl");
const contactNameInput = document.getElementById("contactName");
const contactTitleInput = document.getElementById("contactTitle");
const serviceOptions = document.getElementById("service-options");
const statusText = document.getElementById("status-text");
const researchCompany = document.getElementById("research-company");
const researchSummary = document.getElementById("research-summary");
const researchPoints = document.getElementById("research-points");
const previewFrame = document.getElementById("preview-frame");
const previewCard = document.getElementById("preview-card");
const previewTitle = document.getElementById("preview-title");
const publishButton = document.getElementById("publish-button");
const publishResult = document.getElementById("publish-result");
const openPreviewButton = document.getElementById("open-preview-button");
const fullscreenPreviewButton = document.getElementById("fullscreen-preview-button");
const logoutButton = document.getElementById("logout-button");

let generateTimer;
let lastPayload = null;
let lastPage = null;
let previewBlobUrl = null;
const DEFAULT_SELECTED_SERVICES = 4;

function setPreviewActionState(enabled) {
  openPreviewButton.disabled = !enabled;
  fullscreenPreviewButton.disabled = !enabled;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "content-type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error("Authentication required.");
    }
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function setStatus(message) {
  statusText.textContent = message;
}

function getSelectedServices() {
  return [...serviceOptions.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function getPayload() {
  return {
    companyUrl: companyUrlInput.value.trim(),
    contactName: contactNameInput.value.trim(),
    contactTitle: contactTitleInput.value.trim(),
    recommendedServices: getSelectedServices()
  };
}

function hasRequiredFields(payload) {
  return Boolean(payload.companyUrl && payload.contactName);
}

function renderResearch(research) {
  researchCompany.textContent = `${research.companyName} | ${research.industryLabel}`;
  researchSummary.textContent = research.summary;
  researchPoints.innerHTML = "";

  for (const point of research.pressures || []) {
    const item = document.createElement("li");
    item.textContent = point;
    researchPoints.appendChild(item);
  }
}

function updatePreview(page) {
  previewTitle.textContent = page.pageName;
  if (previewBlobUrl) {
    URL.revokeObjectURL(previewBlobUrl);
  }

  previewBlobUrl = URL.createObjectURL(new Blob([page.previewHtml], {
    type: "text/html"
  }));
  previewFrame.removeAttribute("srcdoc");
  previewFrame.src = previewBlobUrl;
  lastPage = page;
  setPreviewActionState(true);
}

function requirePreviewForAction() {
  if (previewBlobUrl) {
    return true;
  }

  setStatus("Generate a preview first.");
  return false;
}

function openPreviewInWindow() {
  if (!requirePreviewForAction()) {
    return;
  }

  const popupUrl = URL.createObjectURL(new Blob([lastPage.previewHtml], {
    type: "text/html"
  }));
  const popup = window.open(popupUrl, "_blank", "noopener,noreferrer");
  if (!popup) {
    setStatus("Allow pop-ups to open the full preview in a new tab.");
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(popupUrl), 60 * 1000);
}

async function togglePreviewFullscreen() {
  if (!requirePreviewForAction()) {
    return;
  }

  try {
    if (document.fullscreenElement === previewCard) {
      await document.exitFullscreen();
      return;
    }

    await previewCard.requestFullscreen();
  } catch (error) {
    setStatus(error.message || "Unable to enter fullscreen preview.");
  }
}

async function generatePreview() {
  const payload = getPayload();

  if (!hasRequiredFields(payload)) {
    return;
  }

  lastPayload = payload;
  setStatus("Researching company and generating preview...");

  const data = await fetchJson("/api/generate-page", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  updatePreview(data.page);
  renderResearch(data.research);
  setStatus(`Preview ready for ${data.research.companyName}.`);
}

function schedulePreview() {
  window.clearTimeout(generateTimer);
  generateTimer = window.setTimeout(async () => {
    try {
      await generatePreview();
    } catch (error) {
      setStatus(error.message);
    }
  }, 600);
}

function renderServices(services) {
  serviceOptions.innerHTML = services
    .map(
      (service, index) => `
        <label class="service-option">
          <input type="checkbox" value="${service.id}" ${index < DEFAULT_SELECTED_SERVICES ? "checked" : ""} />
          <div>
            <strong>${service.cardTitle}</strong>
            <p>${service.cardSummary}</p>
          </div>
        </label>
      `
    )
    .join("");
}

async function publishDraft() {
  const payload = lastPayload || getPayload();
  if (!hasRequiredFields(payload)) {
    setStatus("Enter a company URL and contact name before publishing.");
    return;
  }

  setStatus("Publishing draft...");
  publishResult.hidden = true;

  const data = await fetchJson("/api/publish", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  updatePreview(data.page);
  renderResearch(data.research);
  publishResult.hidden = false;
  publishResult.textContent = JSON.stringify(data.publication, null, 2);
  setStatus("Draft published successfully.");
}

async function initialize() {
  try {
    const servicesResponse = await fetchJson("/api/services");
    renderServices(servicesResponse.services);
  } catch (error) {
    setStatus(error.message);
  }
}

logoutButton.addEventListener("click", async () => {
  try {
    await fetchJson("/api/auth/logout", {
      method: "POST"
    });
    window.location.href = "/login";
  } catch (error) {
    setStatus(error.message);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await generatePreview();
  } catch (error) {
    setStatus(error.message);
  }
});

publishButton.addEventListener("click", async () => {
  try {
    await publishDraft();
  } catch (error) {
    setStatus(error.message);
  }
});

openPreviewButton.addEventListener("click", () => {
  openPreviewInWindow();
});

fullscreenPreviewButton.addEventListener("click", async () => {
  await togglePreviewFullscreen();
});

companyUrlInput.addEventListener("input", schedulePreview);
contactNameInput.addEventListener("input", schedulePreview);
contactTitleInput.addEventListener("input", schedulePreview);
serviceOptions.addEventListener("change", schedulePreview);

setPreviewActionState(false);
initialize();

window.addEventListener("beforeunload", () => {
  if (previewBlobUrl) {
    URL.revokeObjectURL(previewBlobUrl);
  }
});
