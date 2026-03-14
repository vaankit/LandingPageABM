import { escapeHtml } from "./utils.js";

function renderWordmark() {
  return `
    <div class="brand-lockup" aria-label="Spot.AI">
      <span class="brand-lockup-dot"></span>
      <span class="brand-lockup-text">Spot.AI</span>
    </div>
  `;
}

function renderList(items, className = "") {
  return items.map((item) => `<li class="${className}">${escapeHtml(item)}</li>`).join("");
}

function renderCaseStudies(caseStudies) {
  return caseStudies
    .map((study) => `
      <article class="case-card">
        <h3>${escapeHtml(study.title)}</h3>
        <p>${escapeHtml(study.summary)}</p>
      </article>
    `)
    .join("");
}

function renderRecommendationCards(services) {
  return services
    .map((service) => `
      <article class="recommendation-card">
        <p class="eyebrow">${escapeHtml(service.name)}</p>
        <h3>${escapeHtml(service.cardTitle)}</h3>
        <p>${escapeHtml(service.cardSummary)}</p>
      </article>
    `)
    .join("");
}

function renderServiceDetails(services) {
  return services
    .map((service) => `
      <section class="service-detail">
        <div class="service-detail-header">
          <p class="eyebrow">Recommended Service</p>
          <h3>${escapeHtml(service.cardTitle)}</h3>
          <span class="timeline">${escapeHtml(service.timeline)}</span>
        </div>
        <div class="service-detail-grid">
          <div>
            <h4>What to anticipate</h4>
            <ul>${renderList(service.anticipate)}</ul>
          </div>
          <div>
            <h4>Deliverables and outcomes</h4>
            <ul>${renderList(service.deliverables)}</ul>
          </div>
          <div>
            <h4>Why Spot.AI</h4>
            <ul>${renderList(service.differentiators)}</ul>
          </div>
        </div>
      </section>
    `)
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

  const trustBadgeHtml = trustBadges
    .map((badge) => `<li>${escapeHtml(badge)}</li>`)
    .join("");

  const researchEvidence = (research.evidence || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.pageName)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <style>
      :root {
        --ink-950: #020d17;
        --ink-900: #071824;
        --ink-800: #0d2433;
        --mist: #eef8fb;
        --body: #9cb9c8;
        --harbor: #53d6df;
        --wind: #87f7df;
        --violet: #8d8cff;
        --cable: #ff7a59;
        --panel: rgba(12, 28, 43, 0.74);
        --line: rgba(131, 224, 232, 0.18);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Space Grotesk", system-ui, sans-serif;
        color: var(--mist);
        background:
          radial-gradient(circle at 12% 14%, rgba(83,214,223,0.22), transparent 18%),
          radial-gradient(circle at 88% 12%, rgba(141,140,255,0.22), transparent 18%),
          radial-gradient(circle at 88% 82%, rgba(255,122,89,0.16), transparent 18%),
          linear-gradient(160deg, #020d17 0%, #081827 44%, #07121b 100%);
        line-height: 1.6;
        position: relative;
      }
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(circle at center, black, transparent 86%);
      }
      img { max-width: 100%; display: block; }
      a { color: inherit; text-decoration: none; }
      .page-shell { overflow: hidden; }
      .section-inner {
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto;
      }
      .hero {
        position: relative;
        min-height: 700px;
        color: var(--mist);
        background:
          linear-gradient(130deg, rgba(2,13,23,0.88), rgba(7,24,36,0.64)),
          url("${escapeHtml(research.heroImage)}") center/cover no-repeat;
      }
      .hero::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 20% 20%, rgba(83,214,223,0.18), transparent 18%),
          radial-gradient(circle at 80% 15%, rgba(141,140,255,0.16), transparent 18%),
          linear-gradient(180deg, rgba(2,13,23,0.15), rgba(2,13,23,0.72));
      }
      .hero::after {
        content: "";
        position: absolute;
        inset: auto -8% -80px auto;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(83,214,223,0.28), rgba(83,214,223,0));
        filter: blur(14px);
      }
      .hero-grid-lines {
        position: absolute;
        inset: auto 0 0;
        height: 180px;
        background:
          repeating-radial-gradient(circle at 50% 120%, rgba(135,247,223,0.12) 0 2px, transparent 2px 28px);
        opacity: 0.34;
      }
      .hero-content {
        position: relative;
        z-index: 1;
        padding: 34px 0 112px;
      }
      .hero-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 68px;
      }
      .brand-lockup {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        border-radius: 999px;
        border: 1px solid rgba(131,224,232,0.16);
        background: rgba(7,24,36,0.55);
        backdrop-filter: blur(16px);
      }
      .brand-lockup-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, var(--wind) 18%, var(--harbor) 42%, var(--violet) 100%);
        box-shadow: 0 0 22px rgba(83,214,223,0.46);
      }
      .brand-lockup-text {
        font-family: "Sora", sans-serif;
        font-weight: 800;
        font-size: 24px;
        letter-spacing: -0.04em;
      }
      .hero-tag {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        border: 1px solid rgba(131,224,232,0.18);
        border-radius: 999px;
        background: rgba(7,24,36,0.42);
        font-size: 14px;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.25fr 0.75fr;
        gap: 36px;
        align-items: end;
      }
      .eyebrow {
        margin: 0 0 12px;
        color: var(--harbor);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0 0 18px;
        font-size: clamp(40px, 6vw, 72px);
        line-height: 0.98;
        max-width: 10ch;
        font-family: "Sora", sans-serif;
        letter-spacing: -0.05em;
      }
      .hero-copy .intro {
        margin: 0 0 10px;
        font-size: 20px;
        font-weight: 600;
      }
      .hero-copy p {
        margin: 0;
        max-width: 720px;
        color: rgba(238,248,251,0.84);
        font-size: 18px;
      }
      .hero-side {
        padding: 24px;
        border: 1px solid rgba(131,224,232,0.16);
        border-radius: 24px;
        background: rgba(7,24,36,0.55);
        backdrop-filter: blur(14px);
        box-shadow: 0 20px 54px rgba(0,0,0,0.28);
      }
      .hero-side h2 {
        margin: 0 0 10px;
        font-size: 22px;
        font-family: "Sora", sans-serif;
      }
      .hero-side ul {
        margin: 0;
        padding-left: 18px;
        color: rgba(238,248,251,0.88);
      }
      .recognition {
        background: rgba(5,16,26,0.92);
        color: var(--mist);
        padding: 26px 0;
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
      }
      .recognition-row {
        display: flex;
        align-items: center;
        gap: 28px;
        justify-content: space-between;
      }
      .recognition-logos,
      .signal-pills {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
      }
      .signal-pills span {
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(83,214,223,0.08);
        border: 1px solid rgba(83,214,223,0.16);
        color: var(--mist);
        font-size: 13px;
      }
      .insight {
        padding: 78px 0;
        background: linear-gradient(180deg, rgba(7,24,36,0.64) 0%, rgba(4,13,23,0.9) 100%);
      }
      .insight-grid {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 38px;
        align-items: center;
      }
      .insight-media img {
        border-radius: 28px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(131,224,232,0.16);
      }
      .insight-copy h2,
      .recommendations h2,
      .why-us h2,
      .case-studies h2,
      .cta h2 {
        margin: 0 0 14px;
        font-size: clamp(28px, 4vw, 44px);
        line-height: 1.05;
        font-family: "Sora", sans-serif;
        letter-spacing: -0.04em;
      }
      .insight-copy p,
      .recommendations p,
      .why-us p,
      .case-studies p,
      .cta p,
      .service-detail p,
      .service-detail li,
      .recommendation-card p,
      .case-card p {
        color: var(--body);
      }
      .pressure-list,
      .evidence-list {
        padding-left: 20px;
      }
      .framing {
        margin-top: 18px;
        padding: 18px 20px;
        border-left: 4px solid var(--cable);
        background: rgba(255, 122, 89, 0.08);
        border-radius: 12px;
        color: var(--mist);
        font-weight: 600;
      }
      .recommendations {
        padding: 78px 0;
        background: linear-gradient(180deg, rgba(3,17,29,0.98), rgba(5,16,26,0.94));
      }
      .recommendation-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-top: 28px;
      }
      .recommendation-card {
        padding: 24px;
        border: 1px solid rgba(131,224,232,0.12);
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(12,28,43,0.86) 0%, rgba(8,20,32,0.94) 100%);
        box-shadow: 0 22px 50px rgba(0, 0, 0, 0.24);
      }
      .service-details {
        padding: 30px 0 90px;
        background: linear-gradient(180deg, rgba(4,13,23,1), rgba(6,17,29,0.96));
      }
      .service-detail {
        margin-top: 24px;
        padding: 28px;
        border-radius: 26px;
        background: linear-gradient(180deg, rgba(12,28,43,0.9), rgba(7,18,29,0.96));
        box-shadow: 0 18px 54px rgba(0,0,0,0.28);
        border: 1px solid rgba(131,224,232,0.1);
      }
      .service-detail-header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }
      .service-detail-header h3 {
        margin: 0;
        color: var(--wind);
        font-size: 30px;
        font-family: "Sora", sans-serif;
      }
      .timeline {
        display: inline-flex;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(83,214,223,0.12);
        color: var(--mist);
        font-weight: 700;
      }
      .service-detail-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
      }
      .service-detail-grid h4 {
        margin: 0 0 10px;
      }
      .service-detail-grid ul {
        margin: 0;
        padding-left: 20px;
      }
      .why-us {
        padding: 84px 0;
        background: linear-gradient(160deg, rgba(9, 24, 37, 0.98), rgba(4, 10, 19, 1));
        color: var(--mist);
      }
      .why-us p {
        color: rgba(238,248,251,0.72);
      }
      .badge-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin-top: 28px;
        padding: 0;
        list-style: none;
      }
      .badge-grid li {
        padding: 18px 18px 20px;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(83,214,223,0.08), rgba(141,140,255,0.06));
        border: 1px solid rgba(131,224,232,0.12);
        color: var(--mist);
        font-weight: 600;
      }
      .case-studies {
        padding: 84px 0;
        background: linear-gradient(180deg, rgba(5,16,26,0.98), rgba(4,13,23,1));
      }
      .case-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-top: 24px;
      }
      .case-card {
        padding: 24px;
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(12,28,43,0.88) 0%, rgba(7,18,29,0.96) 100%);
        border: 1px solid rgba(131,224,232,0.12);
      }
      .case-card h3 {
        margin: 0 0 10px;
        color: var(--mist);
        font-family: "Sora", sans-serif;
      }
      .cta {
        padding: 86px 0;
        color: var(--mist);
        background:
          radial-gradient(circle at top left, rgba(83,214,223,0.2), transparent 32%),
          radial-gradient(circle at 80% 20%, rgba(141,140,255,0.18), transparent 28%),
          linear-gradient(135deg, #04131f, #071a29 65%, #00070d);
      }
      .cta-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 32px;
        border-radius: 28px;
        background: rgba(7,24,36,0.48);
        border: 1px solid rgba(131,224,232,0.12);
      }
      .cta-panel p {
        color: rgba(238,248,251,0.82);
      }
      .cta-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 240px;
        padding: 16px 22px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--harbor), var(--violet));
        color: #04111d;
        font-weight: 800;
      }
      .footer {
        padding: 30px 0;
        background: #030a10;
        color: rgba(238,248,251,0.8);
        border-top: 1px solid rgba(131,224,232,0.1);
      }
      .footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }
      .footer-brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .footer-links {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      @media (max-width: 1024px) {
        .hero-grid,
        .insight-grid,
        .service-detail-grid,
        .badge-grid,
        .case-grid,
        .recommendation-grid,
        .cta-panel {
          grid-template-columns: 1fr;
          display: grid;
        }
        .recognition-row,
        .footer-row,
        .service-detail-header {
          display: block;
        }
        .hero-topbar {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <section class="hero">
        <div class="section-inner hero-content">
          <div class="hero-topbar">
            ${renderWordmark()}
            <div class="hero-tag">${escapeHtml(brand.location)} | ${escapeHtml(brand.motto)}</div>
          </div>
          <div class="hero-grid">
            <div class="hero-copy">
              <p class="eyebrow">Personalized for ${escapeHtml(research.companyName)}</p>
              <p class="intro">${escapeHtml(greeting)}</p>
              <h1>${escapeHtml(research.heroTitle)}</h1>
              <p>${escapeHtml(research.subhead)}</p>
            </div>
            <aside class="hero-side">
              <h2>Why this matters now</h2>
              <ul>${renderList(research.pressures)}</ul>
            </aside>
          </div>
        </div>
        <div class="hero-grid-lines" aria-hidden="true"></div>
      </section>

      <section class="recognition">
        <div class="section-inner recognition-row">
          <div class="signal-pills">
            <span>Spot.AI</span>
            <span>${escapeHtml(brand.location)}</span>
            <span>AI Strategy</span>
            <span>Cloud + Product Engineering</span>
          </div>
          <p>${escapeHtml(recognition)}</p>
        </div>
      </section>

      <section class="insight">
        <div class="section-inner insight-grid">
          <div class="insight-media">
            <img src="${escapeHtml(research.insightImage)}" alt="${escapeHtml(research.industryLabel)} industry context" />
          </div>
          <div class="insight-copy">
            <p class="eyebrow">Our Understanding of ${escapeHtml(research.companyName)}</p>
            <h2>What we see in ${escapeHtml(research.industryLabel.toLowerCase())} right now</h2>
            <p>${escapeHtml(research.summary)}</p>
            <ul class="pressure-list">${renderList(research.pressures)}</ul>
            ${research.evidence?.length ? `<p class="eyebrow" style="color:#ff6600;margin-top:24px;">Signals from your site</p><ul class="evidence-list">${researchEvidence}</ul>` : ""}
            <div class="framing">${escapeHtml(research.framing)}</div>
          </div>
        </div>
      </section>

      <section class="recommendations">
        <div class="section-inner">
          <p class="eyebrow">Our Recommendation</p>
          <h2>Priority initiatives we recommend for ${escapeHtml(research.companyName)}</h2>
          <p>${escapeHtml(recommendationIntro)}</p>
          <div class="recommendation-grid">${renderRecommendationCards(services)}</div>
        </div>
      </section>

      <section class="service-details">
        <div class="section-inner">
          ${renderServiceDetails(services)}
        </div>
      </section>

      <section class="why-us">
        <div class="section-inner">
          <p class="eyebrow">Why Spot.AI</p>
          <h2>Built for teams that want modern thinking, pragmatic architecture, and hands-on technical delivery</h2>
          <p>${escapeHtml(brand.footerBlurb)}</p>
          <ul class="badge-grid">${trustBadgeHtml}</ul>
        </div>
      </section>

      <section class="case-studies">
        <div class="section-inner">
          <p class="eyebrow">Relevant Success Stories</p>
          <h2>Examples aligned to your industry priorities</h2>
          <p>These examples show the kinds of outcomes Spot.AI is designed to support when visibility, modernization, and execution need to move together.</p>
          <div class="case-grid">${renderCaseStudies(research.caseStudies)}</div>
        </div>
      </section>

      <section class="cta">
        <div class="section-inner">
          <div class="cta-panel">
            <div>
              <p class="eyebrow">Let's Start the Conversation</p>
              <h2>${escapeHtml(ctaText)}</h2>
              <p>${escapeHtml(ctaSubtext)}</p>
            </div>
            <a class="cta-button" href="#">Book a conversation</a>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="section-inner footer-row">
          <div class="footer-brand">
            ${renderWordmark()}
            <span>${escapeHtml(brand.footerBlurb)}</span>
          </div>
          <div class="footer-links">
            ${brand.footerLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>`;
}
