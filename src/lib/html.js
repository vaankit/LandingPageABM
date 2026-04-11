import { escapeHtml } from "./utils.js";

function renderWordmark() {
  return `
    <div class="brand-lockup" aria-label="Spot.AI">
      <span class="brand-mark"></span>
      <span class="brand-lockup-text">Spot.AI</span>
    </div>
  `;
}

function renderList(items, className = "") {
  return items
    .map((item) => `<li${className ? ` class="${className}"` : ""}>${escapeHtml(item)}</li>`)
    .join("");
}

function serviceTitleFragment(service) {
  const byId = {
    "marketing-materials": ["Generate", "materials", "in realtime"],
    "marketing-emails": ["Write", "emails", "in realtime"],
    "holiday-planner": ["Plan", "holiday timing", "with intent"],
    "marketing-assist": ["Get", "marketing help", "on demand"]
  };

  return byId[service?.id] || ["Create", "marketing assets", "with speed"];
}

function buildHeroDisplayLines(services) {
  return serviceTitleFragment(services[0]);
}

function renderHeroDisplayTitle(lines) {
  return lines
    .map((line) => `<span>${escapeHtml(line)}</span>`)
    .join("");
}

function buildHeroLead(research) {
  const companyName = research.companyName || "This account";
  return `${companyName} is balancing growth priorities, campaign momentum, and message clarity.`;
}

function buildDashboardBlurb(research) {
  const pressure = research.pressures?.[0] || "Marketing priorities are visible across the current footprint.";
  return pressure.length > 110 ? `${pressure.slice(0, 107)}...` : pressure;
}

function buildPrimaryCardTitle(service) {
  const byId = {
    "marketing-materials": "Realtime materials",
    "marketing-emails": "Realtime emails",
    "holiday-planner": "Holiday planner",
    "marketing-assist": "Marketing assist"
  };

  return byId[service?.id] || service?.name || "Priority program";
}

function renderRecommendationCards(services) {
  return services
    .map(
      (service, index) => `
        <article class="recommendation-card">
          <p class="card-index">0${index + 1}</p>
          <h3>${escapeHtml(service.cardTitle)}</h3>
          <p>${escapeHtml(service.cardSummary)}</p>
        </article>
      `
    )
    .join("");
}

function renderServiceDetails(services) {
  return services
    .map(
      (service) => `
        <article class="detail-card">
          <div class="detail-card-header">
            <div>
              <p class="detail-kicker">Recommended Service</p>
              <h3>${escapeHtml(service.cardTitle)}</h3>
            </div>
            <span class="timeline-pill">${escapeHtml(service.timeline)}</span>
          </div>
          <div class="detail-grid">
            <section>
              <h4>What to anticipate</h4>
              <ul>${renderList(service.anticipate)}</ul>
            </section>
            <section>
              <h4>Deliverables</h4>
              <ul>${renderList(service.deliverables)}</ul>
            </section>
            <section>
              <h4>Why Spot.AI</h4>
              <ul>${renderList(service.differentiators)}</ul>
            </section>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTrustBadges(trustBadges) {
  return trustBadges
    .map((badge) => `<li>${escapeHtml(badge)}</li>`)
    .join("");
}

function renderCaseStudies(caseStudies) {
  return caseStudies
    .map(
      (study, index) => `
        <article class="story-card">
          <p class="card-index">0${index + 1}</p>
          <h3>${escapeHtml(study.title)}</h3>
          <p>${escapeHtml(study.summary)}</p>
        </article>
      `
    )
    .join("");
}

function renderHeroSignals(signals) {
  return signals
    .map((signal, index) => {
      const label = index === 0 ? "Priority" : index === 1 ? "Insight" : "Momentum";
      return `
        <article class="signal-card">
          <span>${label}</span>
          <strong>${escapeHtml(signal)}</strong>
        </article>
      `;
    })
    .join("");
}

function renderDashboardServiceRows(services) {
  return services
    .slice(0, 4)
    .map(
      (service, index) => `
        <div class="dashboard-row">
          <div class="dashboard-row-copy">
            <span>${index + 1}</span>
            <strong>${escapeHtml(service.name)}</strong>
          </div>
          <em>${escapeHtml(service.timeline)}</em>
        </div>
      `
    )
    .join("");
}

function getBookingApiBaseUrl() {
  return String(process.env.PUBLIC_BOOKING_API_URL || process.env.PUBLIC_BASE_URL || process.env.APP_URL || "").trim();
}

function serializeForInlineScript(value) {
  return JSON.stringify(value).replaceAll("</", "<\\/");
}

function renderBookingWidget(page) {
  const bookingContext = {
    apiBaseUrl: getBookingApiBaseUrl(),
    sourcePageTitle: page.pageName,
    defaultCompanyName: page.research.companyName || "",
    requestedServices: page.services.map((service) => service.name),
    defaultIntent: "demo"
  };

  return `
    <div class="booking-backdrop" id="booking-backdrop" hidden></div>
    <section class="booking-modal" id="booking-modal" aria-hidden="true" hidden>
      <div class="booking-panel" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button class="booking-close" id="booking-close" type="button" aria-label="Close booking form">Close</button>

        <div class="booking-header">
          <p class="eyebrow">Book with Spot.AI</p>
          <h2 id="booking-title">Book a Demo</h2>
          <p id="booking-copy">Choose a time that suits you and, if you'd like, request a callback from Spot.AI's automated booking assistant.</p>
        </div>

        <form class="booking-form" id="booking-form">
          <div class="booking-field-grid">
            <label class="booking-field">
              <span>Name</span>
              <input name="fullName" type="text" autocomplete="name" placeholder="Your name" required />
            </label>

            <label class="booking-field">
              <span>Work email</span>
              <input name="workEmail" type="email" autocomplete="email" placeholder="you@company.com" required />
            </label>

            <label class="booking-field">
              <span>Company</span>
              <input name="companyName" type="text" autocomplete="organization" value="${escapeHtml(page.research.companyName || "")}" placeholder="Company name" />
            </label>

            <label class="booking-field">
              <span>Phone</span>
              <input name="phone" type="tel" autocomplete="tel" placeholder="+64..." />
            </label>
          </div>

          <div class="booking-field-grid">
            <label class="booking-field">
              <span>Preferred date and time</span>
              <input id="booking-preferred-time" name="preferredDateTime" type="datetime-local" required />
            </label>

            <label class="booking-field">
              <span>Your timezone</span>
              <input id="booking-timezone-label" type="text" value="" readonly />
            </label>
          </div>

          <label class="booking-field">
            <span>Notes</span>
            <textarea name="notes" rows="4" placeholder="What would you like to cover in the call?"></textarea>
          </label>

          <label class="booking-checkbox">
            <input name="requestCallback" type="checkbox" />
            <span>Ask Spot.AI's automated booking assistant to call me after I submit this request.</span>
          </label>

          <p class="booking-hint">The callback assistant sounds natural, but it will identify itself as Spot.AI's automated booking assistant.</p>
          <p class="booking-status" id="booking-status" hidden></p>
          <div class="booking-suggestions" id="booking-suggestions" hidden></div>

          <div class="booking-button-row">
            <button class="nav-button booking-submit" type="submit">Send Request</button>
            <button class="booking-secondary" id="booking-cancel" type="button">Not now</button>
          </div>
        </form>
      </div>
    </section>

    <script>
      const BOOKING_CONTEXT = ${serializeForInlineScript(bookingContext)};

      (() => {
        const modal = document.getElementById("booking-modal");
        const backdrop = document.getElementById("booking-backdrop");
        const closeButton = document.getElementById("booking-close");
        const cancelButton = document.getElementById("booking-cancel");
        const form = document.getElementById("booking-form");
        const title = document.getElementById("booking-title");
        const copy = document.getElementById("booking-copy");
        const status = document.getElementById("booking-status");
        const suggestions = document.getElementById("booking-suggestions");
        const preferredTime = document.getElementById("booking-preferred-time");
        const timezoneLabel = document.getElementById("booking-timezone-label");
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        const intentCopy = {
          demo: {
            title: "Book a Demo",
            copy: "Pick a time and we’ll line up a focused demo around the marketing workflows that matter most."
          },
          "intro-call": {
            title: "Book an Intro Call",
            copy: "Choose a time for a quick introduction and we’ll make sure the right context is ready before the call."
          }
        };

        function setStatus(message, tone) {
          if (!message) {
            status.hidden = true;
            status.textContent = "";
            status.dataset.tone = "";
            return;
          }

          status.hidden = false;
          status.textContent = message;
          status.dataset.tone = tone || "info";
        }

        function clearSuggestions() {
          suggestions.hidden = true;
          suggestions.innerHTML = "";
        }

        function setMinimumTime() {
          const next = new Date(Date.now() + 30 * 60 * 1000);
          next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
          preferredTime.min = toLocalInputValue(next.toISOString());
        }

        function openModal(intent) {
          const nextIntent = intent === "intro-call" ? "intro-call" : "demo";
          modal.dataset.intent = nextIntent;
          title.textContent = intentCopy[nextIntent].title;
          copy.textContent = intentCopy[nextIntent].copy;
          modal.hidden = false;
          modal.setAttribute("aria-hidden", "false");
          backdrop.hidden = false;
          timezoneLabel.value = timeZone;
          setMinimumTime();
          clearSuggestions();
          setStatus("");
          window.requestAnimationFrame(() => {
            form.elements.fullName.focus();
          });
        }

        function closeModal() {
          modal.hidden = true;
          modal.setAttribute("aria-hidden", "true");
          backdrop.hidden = true;
          clearSuggestions();
          setStatus("");
        }

        function toIso(localValue) {
          const date = new Date(localValue);
          return Number.isNaN(date.getTime()) ? "" : date.toISOString();
        }

        function toLocalInputValue(isoValue) {
          const date = new Date(isoValue);
          if (Number.isNaN(date.getTime())) {
            return "";
          }

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
        }

        function renderSuggestions(items) {
          if (!Array.isArray(items) || !items.length) {
            clearSuggestions();
            return;
          }

          suggestions.hidden = false;
          suggestions.innerHTML = items
            .map((item) => {
              return '<button class="booking-suggestion" type="button" data-start-iso="' + item.startIso + '">' + item.label + '</button>';
            })
            .join("");
        }

        async function submitBooking(event) {
          event.preventDefault();
          clearSuggestions();
          setStatus("Sending your request...", "info");

          const preferredDateTimeIso = toIso(form.elements.preferredDateTime.value);
          if (!preferredDateTimeIso) {
            setStatus("Please choose a valid preferred date and time.", "error");
            return;
          }

          const apiBase = (BOOKING_CONTEXT.apiBaseUrl || window.location.origin || "").replace(/\\/$/, "");
          if (!apiBase) {
            setStatus("Booking API base URL is missing.", "error");
            return;
          }

          const payload = {
            intent: modal.dataset.intent || BOOKING_CONTEXT.defaultIntent || "demo",
            fullName: form.elements.fullName.value.trim(),
            workEmail: form.elements.workEmail.value.trim(),
            companyName: form.elements.companyName.value.trim(),
            phone: form.elements.phone.value.trim(),
            preferredDateTimeIso,
            timeZone,
            notes: form.elements.notes.value.trim(),
            requestCallback: form.elements.requestCallback.checked,
            requestedServices: BOOKING_CONTEXT.requestedServices || [],
            sourcePageTitle: BOOKING_CONTEXT.sourcePageTitle,
            sourcePageUrl: window.location.href
          };

          try {
            const response = await fetch(apiBase + "/api/public/booking/request", {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
              if (response.status === 409) {
                setStatus(data.error || "That time is no longer available.", "warn");
                renderSuggestions(data.suggestions || []);
                return;
              }

              throw new Error(data.error || "Unable to submit your booking request.");
            }

            const voiceMessage = data.voiceCall?.status === "queued"
              ? " A callback has been queued."
              : "";
            const calendarMessage = data.calendar?.event?.hangoutLink
              ? " Check your email for the calendar invite and Meet link."
              : " We have saved your requested time.";

            setStatus("Thanks, your request is in." + calendarMessage + voiceMessage, "success");
            form.reset();
            form.elements.companyName.value = BOOKING_CONTEXT.defaultCompanyName || "";
            timezoneLabel.value = timeZone;
            clearSuggestions();
          } catch (error) {
            setStatus(error.message || "Unable to submit your booking request.", "error");
          }
        }

        document.querySelectorAll("[data-booking-trigger]").forEach((trigger) => {
          trigger.addEventListener("click", (event) => {
            event.preventDefault();
            openModal(trigger.dataset.bookingTrigger || "demo");
          });
        });

        suggestions.addEventListener("click", (event) => {
          const button = event.target.closest("[data-start-iso]");
          if (!button) {
            return;
          }

          preferredTime.value = toLocalInputValue(button.dataset.startIso);
          setStatus("Suggested time applied. You can submit again now.", "info");
        });

        form.addEventListener("submit", submitBooking);
        closeButton.addEventListener("click", closeModal);
        cancelButton.addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && !modal.hidden) {
            closeModal();
          }
        });

        timezoneLabel.value = timeZone;
        setMinimumTime();
      })();
    </script>
  `;
}

export function renderLandingPageHtml(page) {
  const {
    brand,
    greeting,
    research,
    services,
    trustBadges,
    recognition,
    recommendationIntro,
    ctaText,
    ctaSubtext
  } = page;

  const heroSignals = (research.evidence?.length ? research.evidence : research.pressures).slice(0, 3);
  const primaryPressure = research.pressures[0] || "Marketing momentum is rising across the account.";
  const industryLabel = research.industryLabel || "Industry";
  const understandingTitle = `What we see across ${industryLabel.toLowerCase()} teams right now`;
  const heroDisplayLines = buildHeroDisplayLines(services);
  const heroDisplayTitle = renderHeroDisplayTitle(heroDisplayLines);
  const heroLead = buildHeroLead(research);
  const dashboardBlurb = buildDashboardBlurb(research);
  const primaryCardTitle = buildPrimaryCardTitle(services[0]);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.pageName)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <style>
      :root {
        --lavender: #eae7f2;
        --navy: #0e0161;
        --ink: #04011c;
        --brand-blue: #273aba;
        --cyan: #4393c8;
        --soft-purple: #b1a7ef;
        --magenta: #ba5cb1;
        --plum: #5a3747;
        --white: #ffffff;
        --body: rgba(234, 231, 242, 0.76);
        --body-dark: rgba(4, 1, 28, 0.72);
        --line-light: rgba(234, 231, 242, 0.12);
        --line-dark: rgba(4, 1, 28, 0.1);
        --shadow-hero: 0 36px 120px rgba(4, 1, 28, 0.38);
        --shadow-card: 0 18px 48px rgba(14, 1, 97, 0.16);
        --radius-xl: 36px;
        --radius-lg: 28px;
        --radius-md: 20px;
      }

      * { box-sizing: border-box; }

      html { scroll-behavior: smooth; }

      body {
        margin: 0;
        font-family: "Inter", system-ui, sans-serif;
        color: var(--white);
        background:
          radial-gradient(circle at 10% 0%, rgba(177, 167, 239, 0.18), transparent 24%),
          radial-gradient(circle at 88% 8%, rgba(186, 92, 177, 0.2), transparent 22%),
          radial-gradient(circle at 70% 58%, rgba(67, 147, 200, 0.12), transparent 26%),
          linear-gradient(145deg, #04011c 0%, #0e0161 46%, #273aba 100%);
      }

      a { color: inherit; text-decoration: none; }
      img { display: block; max-width: 100%; }

      .page-shell {
        position: relative;
        overflow: hidden;
        min-height: 100vh;
        padding: 28px 18px 84px;
      }

      .page-shell::before,
      .page-shell::after {
        content: "";
        position: absolute;
        border-radius: 50%;
        filter: blur(30px);
        pointer-events: none;
      }

      .page-shell::before {
        width: 320px;
        height: 320px;
        top: 90px;
        right: -80px;
        background: rgba(186, 92, 177, 0.22);
      }

      .page-shell::after {
        width: 280px;
        height: 280px;
        left: -100px;
        bottom: 80px;
        background: rgba(67, 147, 200, 0.16);
      }

      .stack {
        position: relative;
        z-index: 1;
        width: min(1220px, 100%);
        margin: 0 auto;
      }

      .hero-stage,
      .surface-light,
      .surface-dark {
        border-radius: var(--radius-xl);
        overflow: hidden;
      }

      .hero-stage {
        position: relative;
        min-height: 980px;
        padding: 24px 24px 36px;
        background:
          radial-gradient(circle at 100% 0%, rgba(177, 167, 239, 0.14), transparent 34%),
          linear-gradient(160deg, rgba(14, 1, 97, 0.94), rgba(4, 1, 28, 0.96));
        border: 1px solid var(--line-light);
        box-shadow: var(--shadow-hero);
      }

      .surface-light {
        margin-top: 24px;
        padding: 30px;
        background: linear-gradient(180deg, rgba(234, 231, 242, 0.98), rgba(255, 255, 255, 0.96));
        color: var(--ink);
        box-shadow: var(--shadow-card);
      }

      .surface-dark {
        margin-top: 24px;
        padding: 30px;
        background:
          radial-gradient(circle at 100% 0%, rgba(177, 167, 239, 0.12), transparent 30%),
          linear-gradient(180deg, rgba(14, 1, 97, 0.94), rgba(4, 1, 28, 0.98));
        border: 1px solid var(--line-light);
        box-shadow: var(--shadow-hero);
      }

      .hero-nav {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 20px;
      }

      .brand-lockup {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .brand-mark {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: linear-gradient(180deg, #ffffff, #b1a7ef);
        box-shadow: 0 0 0 8px rgba(234, 231, 242, 0.08);
      }

      .brand-lockup-text {
        font-family: "Sora", sans-serif;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.06em;
      }

      .hero-nav nav {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        color: var(--body);
        font-size: 14px;
      }

      .nav-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 18px;
        border-radius: 999px;
        background: var(--lavender);
        color: var(--ink);
        font-size: 14px;
        font-weight: 700;
      }

      .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 0.98fr) minmax(480px, 0.92fr);
        gap: 10px;
        align-items: start;
        margin-top: 56px;
      }

      .hero-copy {
        max-width: 760px;
        padding-top: 54px;
      }

      .eyebrow,
      .detail-kicker {
        margin: 0 0 14px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .eyebrow {
        color: rgba(234, 231, 242, 0.68);
      }

      .surface-light .eyebrow {
        color: rgba(4, 1, 28, 0.48);
      }

      .detail-kicker {
        color: rgba(4, 1, 28, 0.48);
      }

      .hero-copy .greeting {
        max-width: 760px;
        margin: 0 0 24px;
        color: rgba(234, 231, 242, 0.74);
        font-size: 15px;
        line-height: 1.6;
      }

      .hero-copy h1,
      .section-header h2,
      .cta-panel h2,
      .recommendation-card h3,
      .detail-card h3,
      .story-card h3 {
        margin: 0;
        font-family: "Sora", sans-serif;
        letter-spacing: -0.07em;
      }

      .hero-copy h1 {
        max-width: none;
        font-size: clamp(3.7rem, 6.8vw, 6.3rem);
        line-height: 0.9;
      }

      .hero-copy h1 span {
        display: block;
        white-space: nowrap;
      }

      .hero-subhead {
        display: none;
      }

      .hero-visual {
        position: relative;
        min-height: 820px;
      }

      .hero-visual::before,
      .hero-visual::after {
        content: "";
        position: absolute;
        border-radius: 50%;
        filter: blur(10px);
      }

      .hero-visual::before {
        width: 240px;
        height: 240px;
        top: 10%;
        right: 6%;
        background: radial-gradient(circle, rgba(67, 147, 200, 0.38), transparent 72%);
      }

      .hero-visual::after {
        width: 220px;
        height: 220px;
        left: 0;
        bottom: 10%;
        background: radial-gradient(circle, rgba(186, 92, 177, 0.34), transparent 72%);
      }

      .floating-card,
      .dashboard-card {
        backdrop-filter: blur(18px);
      }

      .floating-card {
        position: absolute;
        z-index: 2;
        max-width: 210px;
        padding: 16px 18px;
        border-radius: 22px;
        background: rgba(234, 231, 242, 0.96);
        color: var(--ink);
        box-shadow: 0 20px 44px rgba(4, 1, 28, 0.18);
        animation: float 7s ease-in-out infinite;
      }

      .floating-card span {
        display: block;
        margin-bottom: 8px;
        color: rgba(4, 1, 28, 0.46);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .floating-card strong {
        display: block;
        font-size: 16px;
        line-height: 1.45;
      }

      .floating-card.top {
        top: 146px;
        right: 0;
        max-width: 300px;
      }

      .floating-card.bottom {
        left: 0;
        bottom: 40px;
        animation-delay: -3s;
      }

      .dashboard-card {
        position: relative;
        z-index: 1;
        width: min(100%, 620px);
        margin: 188px 0 0 auto;
        padding: 22px;
        border-radius: 40px;
        background: linear-gradient(180deg, rgba(234, 231, 242, 0.96), rgba(255, 255, 255, 0.98));
        color: var(--ink);
        box-shadow: 0 34px 80px rgba(4, 1, 28, 0.28);
      }

      .dashboard-card::before {
        content: "";
        position: absolute;
        inset: 14px;
        border-radius: 26px;
        border: 1px solid rgba(39, 58, 186, 0.08);
        pointer-events: none;
      }

      .dashboard-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 22px;
      }

      .dashboard-top strong {
        font-size: 14px;
      }

      .dashboard-chip {
        display: inline-flex;
        align-items: center;
        min-height: 34px;
        padding: 0 12px;
        border-radius: 999px;
        background: rgba(39, 58, 186, 0.08);
        color: var(--brand-blue);
        font-size: 12px;
        font-weight: 700;
      }

      .dashboard-balance {
        padding: 28px;
        border-radius: 30px;
        background:
          radial-gradient(circle at top right, rgba(177, 167, 239, 0.56), transparent 34%),
          linear-gradient(145deg, #0e0161 0%, #273aba 70%, #4393c8 100%);
        color: var(--white);
      }

      .dashboard-balance p {
        margin: 0;
        color: rgba(234, 231, 242, 0.72);
        font-size: 13px;
      }

      .dashboard-balance strong {
        display: block;
        max-width: 8ch;
        margin-top: 12px;
        font-family: "Sora", sans-serif;
        font-size: clamp(2.4rem, 4vw, 3.25rem);
        line-height: 0.98;
        letter-spacing: -0.06em;
      }

      .dashboard-balance span {
        display: block;
        margin-top: 12px;
        max-width: 30ch;
        color: rgba(234, 231, 242, 0.82);
        font-size: 15px;
        line-height: 1.6;
      }

      .chart-strip {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
        align-items: end;
        margin-top: 22px;
        min-height: 138px;
      }

      .chart-bar {
        border-radius: 18px 18px 10px 10px;
        background: linear-gradient(180deg, rgba(234, 231, 242, 0.9), rgba(177, 167, 239, 0.4));
      }

      .chart-bar:nth-child(1) { height: 52px; }
      .chart-bar:nth-child(2) { height: 88px; }
      .chart-bar:nth-child(3) { height: 118px; }
      .chart-bar:nth-child(4) { height: 96px; }
      .chart-bar:nth-child(5) { height: 128px; background: linear-gradient(180deg, #ffffff, rgba(67, 147, 200, 0.44)); }

      .dashboard-list {
        display: grid;
        gap: 12px;
        margin-top: 20px;
      }

      .dashboard-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(39, 58, 186, 0.05);
      }

      .dashboard-row-copy {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .dashboard-row-copy span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(39, 58, 186, 0.08);
        color: var(--brand-blue);
        font-size: 12px;
        font-weight: 800;
      }

      .dashboard-row-copy strong,
      .dashboard-row em {
        font-size: 13px;
      }

      .dashboard-row em {
        font-style: normal;
        color: rgba(4, 1, 28, 0.52);
      }

      .surface-light .section-header,
      .surface-dark .section-header {
        display: grid;
        gap: 14px;
        margin-bottom: 22px;
      }

      .section-header h2 {
        font-size: clamp(2rem, 4.2vw, 3.35rem);
        line-height: 0.95;
        text-wrap: balance;
      }

      .surface-light .section-header p,
      .surface-light .section-copy,
      .surface-light .story-card p,
      .surface-light .recommendation-card p,
      .surface-light .detail-grid li,
      .surface-light .footer-meta {
        color: var(--body-dark);
      }

      .surface-dark .section-header p,
      .surface-dark .recommendation-card p,
      .surface-dark .badge-grid li,
      .surface-dark .cta-panel p,
      .surface-dark .footer-meta {
        color: rgba(234, 231, 242, 0.72);
      }

      .understanding-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: 24px;
        align-items: center;
      }

      .insight-column {
        display: grid;
        gap: 16px;
      }

      .signal-grid {
        display: grid;
        gap: 14px;
      }

      .signal-card {
        padding: 18px 20px;
        border-radius: var(--radius-md);
        background: rgba(39, 58, 186, 0.06);
      }

      .signal-card span {
        display: block;
        margin-bottom: 8px;
        color: rgba(4, 1, 28, 0.46);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .signal-card strong {
        display: block;
        font-size: 15px;
        line-height: 1.55;
      }

      .evidence-box {
        padding: 20px 22px;
        border-radius: var(--radius-md);
        background: rgba(177, 167, 239, 0.16);
      }

      .evidence-box ul,
      .detail-grid ul {
        margin: 10px 0 0;
        padding-left: 18px;
      }

      .evidence-box li,
      .detail-grid li {
        line-height: 1.68;
      }

      .framing-box {
        padding: 22px 24px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, #273aba, #ba5cb1);
        color: var(--white);
        font-size: 15px;
        line-height: 1.68;
      }

      .insight-visual {
        min-height: 420px;
        border-radius: var(--radius-lg);
        background:
          linear-gradient(180deg, rgba(14, 1, 97, 0.12), rgba(14, 1, 97, 0.02)),
          url("${escapeHtml(research.insightImage)}") center/cover no-repeat;
        box-shadow: var(--shadow-card);
      }

      .recommendation-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .recommendation-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        background: rgba(234, 231, 242, 0.08);
        border: 1px solid rgba(234, 231, 242, 0.12);
      }

      .surface-light .recommendation-card {
        background: rgba(39, 58, 186, 0.05);
        border-color: rgba(39, 58, 186, 0.08);
      }

      .card-index {
        margin: 0 0 14px;
        color: rgba(234, 231, 242, 0.58);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .surface-light .card-index,
      .surface-light .story-card .card-index {
        color: rgba(4, 1, 28, 0.42);
      }

      .recommendation-card h3 {
        font-size: 28px;
        line-height: 1;
      }

      .detail-stack {
        display: grid;
        gap: 18px;
      }

      .detail-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        background: rgba(39, 58, 186, 0.05);
      }

      .detail-card-header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
      }

      .detail-card h3 {
        font-size: 30px;
        line-height: 0.98;
        color: var(--ink);
      }

      .timeline-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 0 15px;
        border-radius: 999px;
        background: rgba(39, 58, 186, 0.1);
        color: var(--brand-blue);
        font-size: 13px;
        font-weight: 700;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .detail-grid section {
        padding: 18px;
        border-radius: var(--radius-md);
        background: rgba(255, 255, 255, 0.62);
      }

      .detail-grid h4 {
        margin: 0;
        font-size: 15px;
        color: var(--ink);
      }

      .badge-grid,
      .story-grid,
      .footer-links {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .badge-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .badge-grid li {
        padding: 20px;
        border-radius: var(--radius-md);
        background: rgba(234, 231, 242, 0.08);
        border: 1px solid rgba(234, 231, 242, 0.1);
        font-size: 15px;
        line-height: 1.5;
      }

      .story-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .story-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        background: rgba(39, 58, 186, 0.05);
      }

      .story-card h3 {
        font-size: 28px;
        line-height: 1;
        color: var(--ink);
      }

      .cta-panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 24px;
        align-items: center;
      }

      .cta-panel h2 {
        font-size: clamp(2rem, 4.2vw, 3.35rem);
        line-height: 0.95;
        text-wrap: balance;
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
        margin-top: 22px;
        padding-top: 22px;
        border-top: 1px solid rgba(234, 231, 242, 0.12);
      }

      .footer-meta {
        display: grid;
        gap: 10px;
      }

      .footer-links {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
      }

      .booking-backdrop {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: rgba(4, 1, 28, 0.72);
        backdrop-filter: blur(12px);
      }

      .booking-modal {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        padding: 20px;
      }

      .booking-backdrop[hidden],
      .booking-modal[hidden] {
        display: none !important;
      }

      .booking-panel {
        width: min(720px, 100%);
        max-height: min(90vh, 920px);
        overflow: auto;
        padding: 28px;
        border: 1px solid rgba(234, 231, 242, 0.14);
        border-radius: 30px;
        background:
          radial-gradient(circle at top right, rgba(67, 147, 200, 0.18), transparent 32%),
          linear-gradient(160deg, rgba(14, 1, 97, 0.98), rgba(4, 1, 28, 0.96));
        box-shadow: 0 30px 90px rgba(4, 1, 28, 0.48);
      }

      .booking-close,
      .booking-secondary,
      .booking-suggestion {
        border: 1px solid rgba(234, 231, 242, 0.16);
        border-radius: 999px;
        background: rgba(234, 231, 242, 0.06);
        color: var(--white);
      }

      .booking-close,
      .booking-secondary {
        padding: 12px 18px;
        font: inherit;
        cursor: pointer;
      }

      .booking-close {
        margin-left: auto;
      }

      .booking-header {
        display: grid;
        gap: 10px;
        margin-top: 18px;
      }

      .booking-header h2 {
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 0.95;
      }

      .booking-form {
        display: grid;
        gap: 18px;
        margin-top: 26px;
      }

      .booking-field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .booking-field {
        display: grid;
        gap: 10px;
      }

      .booking-field span {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .booking-field input,
      .booking-field textarea {
        width: 100%;
        border: 1px solid rgba(234, 231, 242, 0.12);
        border-radius: 18px;
        background: rgba(234, 231, 242, 0.05);
        color: var(--white);
        padding: 16px 18px;
        font: inherit;
      }

      .booking-field input::placeholder,
      .booking-field textarea::placeholder {
        color: rgba(234, 231, 242, 0.42);
      }

      .booking-field input[readonly] {
        color: rgba(234, 231, 242, 0.72);
      }

      .booking-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 18px;
        border: 1px solid rgba(234, 231, 242, 0.12);
        border-radius: 18px;
        background: rgba(234, 231, 242, 0.05);
      }

      .booking-checkbox input {
        margin-top: 3px;
      }

      .booking-hint {
        margin: 0;
        color: rgba(234, 231, 242, 0.62);
        font-size: 14px;
        line-height: 1.6;
      }

      .booking-status {
        margin: 0;
        padding: 14px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.6;
      }

      .booking-status[data-tone="info"] {
        background: rgba(67, 147, 200, 0.16);
      }

      .booking-status[data-tone="success"] {
        background: rgba(54, 196, 104, 0.18);
      }

      .booking-status[data-tone="warn"] {
        background: rgba(255, 196, 87, 0.18);
      }

      .booking-status[data-tone="error"] {
        background: rgba(255, 104, 117, 0.18);
      }

      .booking-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .booking-suggestion {
        padding: 10px 14px;
        font: inherit;
        cursor: pointer;
      }

      .booking-button-row {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        align-items: center;
      }

      .booking-submit {
        border: 0;
        cursor: pointer;
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @media (max-width: 1100px) {
        .hero-grid,
        .understanding-grid,
        .recommendation-grid,
        .detail-grid,
        .badge-grid,
        .story-grid,
        .cta-panel {
          grid-template-columns: 1fr;
        }

        .hero-nav {
          grid-template-columns: 1fr;
          justify-items: start;
        }

        .hero-nav nav {
          justify-content: flex-start;
        }

        .hero-visual {
          min-height: auto;
        }

        .detail-card-header {
          align-items: start;
          flex-direction: column;
        }
      }

      @media (max-width: 760px) {
        .page-shell {
          padding: 16px 12px 56px;
        }

        .hero-stage,
        .surface-light,
        .surface-dark {
          border-radius: 28px;
        }

        .hero-stage,
        .surface-light,
        .surface-dark {
          padding: 18px;
        }

        .hero-copy h1 {
          font-size: clamp(2.8rem, 12vw, 4.8rem);
        }

        .hero-copy h1 span {
          white-space: normal;
        }

        .floating-card {
          position: static;
          max-width: none;
          margin-top: 12px;
        }

        .dashboard-card {
          width: 100%;
          margin-top: 18px;
          padding: 18px;
        }

        .booking-panel {
          padding: 22px 18px;
          border-radius: 24px;
        }

        .booking-field-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <div class="stack">
        <section class="hero-stage">
          <header class="hero-nav">
            ${renderWordmark()}
            <nav aria-label="Primary">
              <a href="#understanding">Understanding</a>
              <a href="#recommendations">Recommendations</a>
              <a href="#details">Services</a>
              <a href="#stories">Stories</a>
              <a href="#contact">Contact</a>
            </nav>
            <a class="nav-button" href="#contact" data-booking-trigger="demo">Book a Demo</a>
          </header>

          <div class="hero-grid">
            <section class="hero-copy">
              <p class="eyebrow">Personalized ABM Page</p>
              <p class="greeting">${escapeHtml(heroLead)}</p>
              <h1>${heroDisplayTitle}</h1>
            </section>

            <section class="hero-visual" aria-label="Fintech-inspired Spot.AI preview">
              <div class="floating-card top">
                <span>Signal</span>
                <strong>${escapeHtml(primaryPressure)}</strong>
              </div>

              <article class="dashboard-card">
                <div class="dashboard-top">
                  <strong>${escapeHtml(research.companyName)}</strong>
                  <span class="dashboard-chip">${escapeHtml(industryLabel)}</span>
                </div>

                <div class="dashboard-balance">
                  <p>ABM opportunity profile</p>
                  <strong>${escapeHtml(primaryCardTitle)}</strong>
                  <span>${escapeHtml(dashboardBlurb)}</span>
                  <div class="chart-strip" aria-hidden="true">
                    <span class="chart-bar"></span>
                    <span class="chart-bar"></span>
                    <span class="chart-bar"></span>
                    <span class="chart-bar"></span>
                    <span class="chart-bar"></span>
                  </div>
                </div>

                <div class="dashboard-list">
                  ${renderDashboardServiceRows(services)}
                </div>
              </article>

              <div class="floating-card bottom">
                <span>Momentum</span>
                <strong>${escapeHtml((research.evidence?.[0] || research.pressures?.[1] || "High-fit account for a focused marketing conversation."))}</strong>
              </div>
            </section>
          </div>
        </section>

        <section id="understanding" class="surface-light">
          <div class="section-header">
            <p class="eyebrow">Our Understanding of ${escapeHtml(research.companyName)}</p>
            <h2>${escapeHtml(understandingTitle)}</h2>
            <p>${escapeHtml(research.summary)}</p>
          </div>

          <div class="understanding-grid">
            <div class="insight-column">
              <div class="signal-grid">
                ${renderHeroSignals(heroSignals)}
              </div>

              ${research.evidence?.length ? `
                <div class="evidence-box">
                  <p class="eyebrow">Signals from the site</p>
                  <ul>${renderList(research.evidence)}</ul>
                </div>
              ` : ""}

              <div class="framing-box">${escapeHtml(research.framing)}</div>
            </div>

            <div class="insight-visual"></div>
          </div>
        </section>

        <section id="recommendations" class="surface-dark">
          <div class="section-header">
            <p class="eyebrow">Our Recommendation</p>
            <h2>Priority initiatives for ${escapeHtml(research.companyName)}</h2>
            <p>${escapeHtml(recommendationIntro)}</p>
          </div>

          <div class="recommendation-grid">
            ${renderRecommendationCards(services)}
          </div>
        </section>

        <section id="details" class="surface-light">
          <div class="section-header">
            <p class="eyebrow">Service Detail</p>
            <h2>How Spot.AI would shape the work</h2>
          </div>

          <div class="detail-stack">
            ${renderServiceDetails(services)}
          </div>
        </section>

        <section class="surface-dark">
          <div class="section-header">
            <p class="eyebrow">Why Spot.AI</p>
            <h2>Built for modern teams that want sharper messaging and faster execution</h2>
            <p>${escapeHtml(recognition)}</p>
          </div>

          <ul class="badge-grid">
            ${renderTrustBadges(trustBadges)}
          </ul>
        </section>

        <section id="stories" class="surface-light">
          <div class="section-header">
            <p class="eyebrow">Success Stories</p>
            <h2>Relevant examples for the same operating pressures</h2>
            <p>These examples show the kinds of outcomes Spot.AI is built to support when planning, messaging, and execution need to move together.</p>
          </div>

          <div class="story-grid">
            ${renderCaseStudies(research.caseStudies)}
          </div>
        </section>

        <section id="contact" class="surface-dark">
          <div class="cta-panel">
            <div>
              <p class="eyebrow">Let's Start the Conversation</p>
              <h2>${escapeHtml(ctaText)}</h2>
              <p>${escapeHtml(ctaSubtext)}</p>
            </div>
            <a class="nav-button" href="#contact" data-booking-trigger="intro-call">Book Intro Call</a>
          </div>

          <footer class="footer">
            <div class="footer-meta">
              ${renderWordmark()}
              <span>${escapeHtml(brand.footerBlurb)}</span>
            </div>

            <div class="footer-links">
              ${brand.footerLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
            </div>
          </footer>
        </section>

        ${renderBookingWidget(page)}
      </div>
    </div>
  </body>
</html>`;
}
