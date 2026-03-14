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

function buildBackdropWords(page) {
  const company = page.research.companyName || "SPOT";
  const industry = page.research.industryLabel || "AI";
  const city = (page.brand.location || "Wellington").split(",")[0];

  return [
    company.toUpperCase(),
    industry.toUpperCase(),
    city.toUpperCase()
  ];
}

function renderBackdropWords(page) {
  return buildBackdropWords(page)
    .map(
      (word, index) => `
        <span class="backdrop-word word-${index + 1}">${escapeHtml(word)}</span>
      `
    )
    .join("");
}

function renderRecognitionChips(brand, services) {
  const chips = [
    brand.location,
    services[0]?.name,
    services[1]?.name,
    "ABM Strategy"
  ].filter(Boolean);

  return chips
    .map((chip) => `<span class="recognition-chip">${escapeHtml(chip)}</span>`)
    .join("");
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
          <div class="detail-card-top">
            <div>
              <p class="section-tag">Service Detail</p>
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
          <p class="story-index">Story 0${index + 1}</p>
          <h3>${escapeHtml(study.title)}</h3>
          <p>${escapeHtml(study.summary)}</p>
        </article>
      `
    )
    .join("");
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
        --royal: #143cff;
        --royal-deep: #0f31d9;
        --royal-soft: rgba(20, 60, 255, 0.08);
        --paper: #f7f7f3;
        --paper-soft: #ffffff;
        --ink: #0e1729;
        --ink-soft: #46506a;
        --line: rgba(14, 23, 41, 0.1);
        --line-strong: rgba(14, 23, 41, 0.18);
        --accent: #ff855f;
        --shadow-lg: 0 34px 100px rgba(7, 18, 68, 0.22);
        --shadow-md: 0 18px 44px rgba(10, 20, 64, 0.14);
        --radius-xl: 38px;
        --radius-lg: 28px;
        --radius-md: 20px;
      }

      * { box-sizing: border-box; }

      html { scroll-behavior: smooth; }

      body {
        margin: 0;
        font-family: "Inter", system-ui, sans-serif;
        color: var(--paper);
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 26%),
          linear-gradient(180deg, #1842ff 0%, #1138ef 48%, #0b2ed4 100%);
      }

      a { color: inherit; text-decoration: none; }
      img { display: block; max-width: 100%; }

      .page-shell {
        position: relative;
        overflow: hidden;
        min-height: 100vh;
        padding: 26px 18px 84px;
      }

      .backdrop-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .backdrop-word {
        position: absolute;
        font-family: "Sora", sans-serif;
        font-size: clamp(5rem, 17vw, 13rem);
        line-height: 0.82;
        letter-spacing: -0.09em;
        color: rgba(255,255,255,0.14);
        text-transform: uppercase;
        white-space: nowrap;
      }

      .word-1 {
        top: 2%;
        left: -4%;
      }

      .word-2 {
        top: 22%;
        right: -8%;
      }

      .word-3 {
        top: 58%;
        left: -3%;
      }

      .main-stack {
        position: relative;
        z-index: 1;
        width: min(1220px, 100%);
        margin: 0 auto;
      }

      .hero-panel,
      .paper-panel,
      .ink-panel {
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
      }

      .hero-panel,
      .paper-panel {
        background: var(--paper-soft);
        color: var(--ink);
      }

      .ink-panel {
        background:
          linear-gradient(180deg, rgba(16, 27, 60, 0.92), rgba(10, 19, 48, 0.96));
        color: var(--paper);
      }

      .hero-panel {
        position: relative;
        padding: 24px 24px 30px;
      }

      .hero-panel::before {
        content: "";
        position: absolute;
        inset: auto 0 0;
        height: 200px;
        background: linear-gradient(180deg, rgba(20,60,255,0), rgba(20,60,255,0.08));
        pointer-events: none;
      }

      .hero-nav {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 20px;
        margin-bottom: 28px;
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
        background: linear-gradient(180deg, #1842ff, #6ca2ff);
        box-shadow: 0 0 0 7px rgba(20, 60, 255, 0.08);
      }

      .brand-lockup-text {
        font-family: "Sora", sans-serif;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.06em;
      }

      .hero-nav nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        color: var(--ink-soft);
        font-size: 14px;
      }

      .hero-nav-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 18px;
        border-radius: 999px;
        background: var(--royal);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
      }

      .hero-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.95fr) minmax(0, 0.78fr);
        gap: 24px;
        align-items: center;
      }

      .eyebrow,
      .section-tag {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .eyebrow {
        color: rgba(14, 23, 41, 0.52);
      }

      .section-tag {
        color: rgba(255,255,255,0.62);
      }

      .hero-copy h1 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: clamp(2.8rem, 5.4vw, 5.4rem);
        line-height: 0.92;
        letter-spacing: -0.085em;
        text-wrap: balance;
      }

      .hero-copy p {
        margin: 16px 0 0;
        color: var(--ink-soft);
        font-size: 15px;
        line-height: 1.68;
      }

      .hero-copy .greeting {
        margin-top: 0;
        color: rgba(14, 23, 41, 0.62);
        font-size: 14px;
        line-height: 1.6;
      }

      .hero-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 24px;
      }

      .primary-pill,
      .secondary-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 20px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 700;
      }

      .primary-pill {
        background: var(--royal);
        color: #fff;
      }

      .secondary-pill {
        border: 1px solid var(--line-strong);
        color: var(--ink);
      }

      .device-stage {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 640px;
      }

      .device-halo {
        position: absolute;
        width: 76%;
        aspect-ratio: 1;
        border-radius: 50%;
        background:
          radial-gradient(circle, rgba(20,60,255,0.22), rgba(20,60,255,0.06) 42%, transparent 68%);
        filter: blur(4px);
      }

      .device-chip {
        position: absolute;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.96);
        color: var(--ink);
        font-size: 13px;
        font-weight: 700;
        box-shadow: var(--shadow-md);
      }

      .device-chip.top-left {
        top: 16%;
        left: 2%;
      }

      .device-chip.bottom-right {
        right: 0;
        bottom: 14%;
      }

      .device-chip::before {
        content: "";
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--accent);
      }

      .device-frame {
        position: relative;
        width: min(340px, 84vw);
        height: 640px;
        padding: 14px;
        border-radius: 42px;
        background: #0d1733;
        box-shadow:
          0 28px 80px rgba(9, 21, 62, 0.26),
          inset 0 0 0 1px rgba(255,255,255,0.08);
      }

      .device-notch {
        position: absolute;
        top: 12px;
        left: 50%;
        width: 124px;
        height: 24px;
        transform: translateX(-50%);
        border-radius: 999px;
        background: #101a38;
        z-index: 2;
      }

      .device-screen {
        height: 100%;
        border-radius: 30px;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgba(20,60,255,0.14), rgba(255,255,255,0)),
          #ffffff;
      }

      .device-appbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 22px 20px 12px;
        color: var(--ink);
      }

      .device-appbar strong {
        font-family: "Sora", sans-serif;
        font-size: 15px;
      }

      .device-hero {
        padding: 10px 20px 20px;
      }

      .device-hero h2 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: 31px;
        line-height: 0.96;
        letter-spacing: -0.07em;
        color: var(--ink);
      }

      .device-hero p {
        margin: 12px 0 18px;
        color: var(--ink-soft);
        font-size: 13px;
        line-height: 1.5;
      }

      .device-image {
        height: 250px;
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(20,60,255,0.06), rgba(20,60,255,0.02)),
          url("${escapeHtml(research.insightImage)}") center/cover no-repeat;
      }

      .device-cards {
        display: grid;
        gap: 12px;
        padding: 0 20px 22px;
      }

      .device-card {
        padding: 14px 16px;
        border-radius: 20px;
        background: #eef2ff;
      }

      .device-card strong {
        display: block;
        margin-bottom: 6px;
        color: var(--ink);
        font-size: 13px;
      }

      .device-card span {
        color: var(--ink-soft);
        font-size: 12px;
        line-height: 1.45;
      }

      .hero-side {
        display: grid;
        gap: 16px;
      }

      .side-card {
        padding: 18px;
        border-radius: var(--radius-lg);
        background: rgba(20, 60, 255, 0.06);
        border: 1px solid var(--line);
      }

      .side-card p,
      .side-card li {
        color: var(--ink-soft);
      }

      .side-card h3 {
        margin: 0 0 10px;
        font-family: "Sora", sans-serif;
        font-size: 20px;
        line-height: 1.04;
        letter-spacing: -0.05em;
      }

      .signal-list,
      .badge-grid,
      .story-grid,
      .recommendation-grid,
      .detail-grid ul,
      .footer-links {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .signal-list {
        display: grid;
        gap: 10px;
      }

      .signal-list li {
        padding-left: 18px;
        position: relative;
        font-size: 14px;
        line-height: 1.55;
      }

      .signal-list li::before {
        content: "";
        position: absolute;
        top: 9px;
        left: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--royal);
      }

      .recognition-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 22px;
      }

      .recognition-chip {
        display: inline-flex;
        align-items: center;
        min-height: 42px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(20, 60, 255, 0.08);
        color: var(--ink);
        font-size: 13px;
        font-weight: 700;
      }

      .stack-section {
        margin-top: 24px;
      }

      .paper-panel,
      .ink-panel {
        padding: 28px;
      }

      .section-header {
        display: grid;
        gap: 14px;
        margin-bottom: 22px;
      }

      .section-header h2 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: clamp(2rem, 4vw, 3.3rem);
        line-height: 0.95;
        letter-spacing: -0.075em;
        text-wrap: balance;
      }

      .section-header p,
      .section-copy,
      .recommendation-card p,
      .detail-card li,
      .story-card p,
      .cta-panel p,
      .footer-meta {
        color: inherit;
        opacity: 0.72;
      }

      .split-section {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: 24px;
        align-items: center;
      }

      .insight-visual {
        min-height: 420px;
        border-radius: calc(var(--radius-lg) + 6px);
        background:
          linear-gradient(180deg, rgba(20,60,255,0.1), rgba(20,60,255,0.02)),
          url("${escapeHtml(research.insightImage)}") center/cover no-repeat;
        box-shadow: var(--shadow-md);
      }

      .insight-copy {
        display: grid;
        gap: 16px;
      }

      .evidence-box {
        padding: 18px 20px;
        border-radius: var(--radius-md);
        background: var(--royal-soft);
      }

      .evidence-box ul,
      .detail-grid ul {
        margin: 10px 0 0;
        padding-left: 18px;
      }

      .framing-box {
        padding: 20px 22px;
        border-radius: var(--radius-md);
        background: var(--royal);
        color: #fff;
        font-size: 15px;
        line-height: 1.6;
      }

      .recommendation-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .recommendation-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
      }

      .card-index,
      .story-index {
        margin: 0 0 14px;
        color: rgba(255,255,255,0.58);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .recommendation-card h3,
      .detail-card h3,
      .story-card h3,
      .cta-panel h2 {
        margin: 0;
        font-family: "Sora", sans-serif;
        line-height: 0.98;
        letter-spacing: -0.06em;
      }

      .recommendation-card h3 {
        font-size: 28px;
      }

      .detail-stack {
        display: grid;
        gap: 18px;
      }

      .detail-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        background: rgba(255,255,255,0.96);
        color: var(--ink);
      }

      .detail-card-top {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
      }

      .detail-card h3 {
        font-size: 30px;
      }

      .timeline-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(20, 60, 255, 0.09);
        color: var(--royal);
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
        background: #f1f4ff;
      }

      .detail-grid h4 {
        margin: 0;
        font-size: 15px;
        color: var(--ink);
      }

      .badge-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .badge-grid li {
        padding: 20px;
        border-radius: var(--radius-md);
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        font-size: 15px;
        line-height: 1.45;
      }

      .story-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .story-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        background: var(--paper-soft);
        color: var(--ink);
      }

      .story-card .story-index,
      .story-card p {
        color: var(--ink-soft);
      }

      .story-card h3 {
        font-size: 28px;
      }

      .cta-panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 24px;
        align-items: center;
      }

      .cta-panel h2 {
        font-size: clamp(2rem, 4vw, 3.4rem);
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.12);
      }

      .footer-meta {
        display: grid;
        gap: 10px;
      }

      .footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      @media (max-width: 1100px) {
        .hero-grid,
        .split-section,
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

        .device-stage {
          min-height: auto;
          padding: 8px 0;
        }

        .detail-card-top {
          align-items: start;
          flex-direction: column;
        }

        .badge-grid,
        .story-grid,
        .recommendation-grid {
          gap: 14px;
        }
      }

      @media (max-width: 760px) {
        .page-shell {
          padding: 14px 12px 54px;
        }

        .hero-panel,
        .paper-panel,
        .ink-panel {
          border-radius: 28px;
        }

        .hero-panel,
        .paper-panel,
        .ink-panel {
          padding: 18px;
        }

        .hero-copy h1 {
          font-size: clamp(2.25rem, 10vw, 3.8rem);
        }

        .device-frame {
          width: min(100%, 320px);
          height: 600px;
        }

        .device-chip.top-left,
        .device-chip.bottom-right {
          position: static;
          margin-top: 10px;
        }

        .device-stage {
          justify-items: stretch;
        }

        .device-chip {
          justify-content: center;
        }

        .backdrop-word {
          font-size: clamp(4rem, 22vw, 7rem);
        }

        .word-1 {
          top: 5%;
          left: -10%;
        }

        .word-2 {
          top: 34%;
          right: -16%;
        }

        .word-3 {
          top: 70%;
          left: -12%;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <div class="backdrop-layer" aria-hidden="true">
        ${renderBackdropWords(page)}
      </div>

      <div class="main-stack">
        <section class="hero-panel">
          <header class="hero-nav">
            ${renderWordmark()}
            <nav aria-label="Primary">
              <a href="#understanding">Understanding</a>
              <a href="#recommendations">Recommendations</a>
              <a href="#details">Service Detail</a>
              <a href="#stories">Stories</a>
              <a href="#contact">Contact</a>
            </nav>
            <a class="hero-nav-cta" href="#contact">Book a Demo</a>
          </header>

          <div class="hero-grid">
            <section class="hero-copy">
              <p class="eyebrow">Personalized ABM Page</p>
              <p class="greeting">${escapeHtml(greeting)}</p>
              <h1>${escapeHtml(research.heroTitle)}</h1>
              <p>${escapeHtml(research.subhead)}</p>
              <div class="hero-actions">
                <a class="primary-pill" href="#contact">Start the Conversation</a>
                <a class="secondary-pill" href="#recommendations">View Recommendations</a>
              </div>
              <div class="recognition-row">
                ${renderRecognitionChips(brand, services)}
              </div>
            </section>

            <section class="device-stage" aria-label="Spot.AI mobile preview">
              <span class="device-chip top-left">${escapeHtml(services[0]?.name || "AI Strategy")}</span>
              <div class="device-halo"></div>
              <div class="device-frame">
                <div class="device-notch"></div>
                <div class="device-screen">
                  <div class="device-appbar">
                    <strong>${escapeHtml(research.companyName)}</strong>
                    <span>${escapeHtml(brand.location)}</span>
                  </div>
                  <div class="device-hero">
                    <h2>${escapeHtml(research.companyName)}</h2>
                    <p>${escapeHtml(research.summary)}</p>
                    <div class="device-image"></div>
                  </div>
                  <div class="device-cards">
                    <div class="device-card">
                      <strong>Primary Pressure</strong>
                      <span>${escapeHtml(research.pressures[0] || "Modernization speed and clarity.")}</span>
                    </div>
                    <div class="device-card">
                      <strong>Recommended Start</strong>
                      <span>${escapeHtml(services[0]?.cardTitle || "ABM discovery and planning.")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span class="device-chip bottom-right">${escapeHtml(services[1]?.name || "Cloud + AI")}</span>
            </section>

            <aside class="hero-side">
              <div class="side-card">
                <p class="eyebrow">Why This Account</p>
                <h3>Signals worth acting on</h3>
                <ul class="signal-list">${renderList(heroSignals)}</ul>
              </div>
              <div class="side-card">
                <p class="eyebrow">Recognition</p>
                <h3>Why Spot.AI feels credible here</h3>
                <p>${escapeHtml(recognition)}</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="understanding" class="paper-panel stack-section">
          <div class="section-header">
            <p class="eyebrow">Our Understanding of ${escapeHtml(research.companyName)}</p>
            <h2>What we see across ${escapeHtml(research.industryLabel.toLowerCase())} teams right now</h2>
            <p>${escapeHtml(research.summary)}</p>
          </div>

          <div class="split-section">
            <div class="insight-copy">
              <div class="evidence-box">
                <p class="eyebrow">Operating pressures</p>
                <ul>${renderList(research.pressures)}</ul>
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

        <section id="recommendations" class="ink-panel stack-section">
          <div class="section-header">
            <p class="section-tag">Our Recommendation</p>
            <h2>Priority initiatives for ${escapeHtml(research.companyName)}</h2>
            <p>${escapeHtml(recommendationIntro)}</p>
          </div>
          <div class="recommendation-grid">${renderRecommendationCards(services)}</div>
        </section>

        <section id="details" class="paper-panel stack-section">
          <div class="section-header">
            <p class="eyebrow">Service Detail</p>
            <h2>How Spot.AI would shape the work</h2>
          </div>
          <div class="detail-stack">${renderServiceDetails(services)}</div>
        </section>

        <section class="ink-panel stack-section">
          <div class="section-header">
            <p class="section-tag">Why Spot.AI</p>
            <h2>Built for modern teams that want sharp thinking and practical delivery</h2>
            <p>${escapeHtml(brand.footerBlurb)}</p>
          </div>
          <ul class="badge-grid">${renderTrustBadges(trustBadges)}</ul>
        </section>

        <section id="stories" class="paper-panel stack-section">
          <div class="section-header">
            <p class="eyebrow">Success Stories</p>
            <h2>Examples aligned to the same operating pressures</h2>
          </div>
          <div class="story-grid">${renderCaseStudies(research.caseStudies)}</div>
        </section>

        <section id="contact" class="ink-panel stack-section">
          <div class="cta-panel">
            <div>
              <p class="section-tag">Let's Start the Conversation</p>
              <h2>${escapeHtml(ctaText)}</h2>
              <p>${escapeHtml(ctaSubtext)}</p>
            </div>
            <a class="primary-pill" href="#contact">Book Intro Call</a>
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
      </div>
    </div>
  </body>
</html>`;
}
