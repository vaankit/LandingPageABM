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
const previewTitle = document.getElementById("preview-title");
const publishButton = document.getElementById("publish-button");
const publishResult = document.getElementById("publish-result");
const providerPill = document.getElementById("provider-pill");

let generateTimer;
let lastPayload = null;
let lastPage = null;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "content-type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
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
  previewFrame.srcdoc = page.previewHtml;
  lastPage = page;
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
          <input type="checkbox" value="${service.id}" ${index < 3 ? "checked" : ""} />
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
  providerPill.textContent = `Provider: ${data.publication.provider}`;
  publishResult.hidden = false;
  publishResult.textContent = JSON.stringify(data.publication, null, 2);
  setStatus(`Draft handled by ${data.publication.provider}.`);
}

async function initialize() {
  try {
    const [servicesResponse, healthResponse] = await Promise.all([
      fetchJson("/api/services"),
      fetchJson("/api/health")
    ]);

    renderServices(servicesResponse.services);
    providerPill.textContent = `Provider: ${healthResponse.provider}`;
  } catch (error) {
    setStatus(error.message);
  }
}

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

companyUrlInput.addEventListener("input", schedulePreview);
contactNameInput.addEventListener("input", schedulePreview);
contactTitleInput.addEventListener("input", schedulePreview);
serviceOptions.addEventListener("change", schedulePreview);

initialize();
