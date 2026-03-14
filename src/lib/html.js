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
      <article class="content-card case-card">
        <p class="mini-label">Case Study</p>
        <h3>${escapeHtml(study.title)}</h3>
        <p>${escapeHtml(study.summary)}</p>
      </article>
    `)
    .join("");
}

function renderRecommendationCards(services) {
  return services
    .map((service) => `
      <article class="content-card recommendation-card">
        <p class="mini-label">${escapeHtml(service.name)}</p>
        <h3>${escapeHtml(service.cardTitle)}</h3>
        <p>${escapeHtml(service.cardSummary)}</p>
      </article>
    `)
    .join("");
}

function renderServiceDetails(services) {
  return services
    .map((service) => `
      <section class="service-detail content-card">
        <div class="service-detail-header">
          <div>
            <p class="mini-label">Recommended Service</p>
            <h3>${escapeHtml(service.cardTitle)}</h3>
          </div>
          <span class="timeline">${escapeHtml(service.timeline)}</span>
        </div>
        <div class="service-detail-grid">
          <div>
            <h4>What to anticipate</h4>
            <ul>${renderList(service.anticipate)}</ul>
          </div>
          <div>
            <h4>Deliverables</h4>
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg-top: #3e3955;
        --bg-bottom: #322f49;
        --panel: #090b0d;
        --panel-soft: rgba(14, 16, 20, 0.88);
        --card: rgba(20, 22, 28, 0.78);
        --line: rgba(255, 255, 255, 0.08);
        --text: #f5f3ee;
        --muted: rgba(255, 255, 255, 0.64);
        --soft: rgba(255, 255, 255, 0.12);
        --accent: #ffffff;
        --violet: #6862b5;
        --glow-gold: #f8ca67;
        --glow-blue: #214fce;
      }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        font-family: "Inter", system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at 20% 10%, rgba(255,255,255,0.08) 0 1px, transparent 1px 100%),
          radial-gradient(circle at 80% 40%, rgba(255,255,255,0.08) 0 1px, transparent 1px 100%),
          linear-gradient(180deg, var(--bg-top), var(--bg-bottom));
        background-size: 260px 260px, 320px 320px, auto;
        min-height: 100vh;
      }
      a { color: inherit; text-decoration: none; }
      img { max-width: 100%; display: block; }
      .page-shell {
        padding: 44px 18px 72px;
      }
      .hero-stage,
      .section-panel {
        width: min(1220px, 100%);
        margin: 0 auto;
        border-radius: 30px;
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 36%),
          linear-gradient(180deg, rgba(12,13,17,0.98), rgba(7,8,10,1));
        border: 1px solid rgba(255,255,255,0.04);
        box-shadow: 0 26px 80px rgba(0,0,0,0.28);
        overflow: hidden;
      }
      .hero-stage {
        position: relative;
        min-height: 760px;
      }
      .hero-stage::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 0%, rgba(255,255,255,0.18), transparent 28%),
          radial-gradient(circle at 50% 100%, rgba(248,202,103,0.12), transparent 24%);
        pointer-events: none;
      }
      .hero-stage::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(circle, rgba(255,255,255,0.6) 0 1px, transparent 1.2px);
        background-size: 180px 180px;
        background-position: 20px 40px;
        opacity: 0.18;
        pointer-events: none;
      }
      .hero-inner {
        position: relative;
        z-index: 1;
        padding: 18px 26px 0;
      }
      .top-nav {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 16px;
      }
      .brand-lockup {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .brand-lockup-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 30% 30%, #fff 0%, #ffe4a4 16%, #f2bb5d 42%, #2656d9 100%);
        box-shadow:
          0 0 18px rgba(248,202,103,0.45),
          0 0 34px rgba(33,79,206,0.3);
      }
      .brand-lockup-text {
        font-family: "Sora", sans-serif;
        font-weight: 700;
        font-size: 22px;
        letter-spacing: -0.04em;
      }
      .nav-links,
      .nav-actions {
        display: flex;
        align-items: center;
        gap: 26px;
      }
      .nav-links {
        justify-content: center;
        font-size: 13px;
        color: var(--muted);
      }
      .nav-actions {
        justify-content: flex-end;
      }
      .nav-ghost,
      .nav-solid {
        padding: 10px 16px;
        border-radius: 999px;
        font-size: 13px;
        line-height: 1;
      }
      .nav-ghost {
        background: rgba(255,255,255,0.05);
      }
      .nav-solid {
        background: #ffffff;
        color: #0a0c11;
      }
      .hero-copy {
        width: min(640px, calc(100% - 16px));
        margin: 74px auto 0;
        text-align: center;
      }
      .mini-label {
        margin: 0 0 10px;
        color: rgba(255,255,255,0.52);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .greeting {
        margin: 0 0 8px;
        color: rgba(255,255,255,0.7);
        font-size: 14px;
      }
      h1 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: clamp(44px, 6vw, 76px);
        line-height: 0.96;
        letter-spacing: -0.07em;
      }
      .hero-subhead {
        width: min(430px, 100%);
        margin: 20px auto 0;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
      }
      .hero-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 24px;
        padding: 14px 24px;
        border-radius: 999px;
        background: #ffffff;
        color: #090b0d;
        font-size: 14px;
        font-weight: 700;
      }
      .liquid-zone {
        position: relative;
        height: 420px;
        margin-top: 36px;
      }
      .liquid-orb {
        position: absolute;
        left: 50%;
        bottom: -90px;
        width: min(720px, 76vw);
        height: min(430px, 50vw);
        transform: translateX(-50%);
        border-radius: 48% 52% 38% 62% / 50% 44% 56% 50%;
        background:
          radial-gradient(circle at 52% 8%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.2) 6%, transparent 16%),
          radial-gradient(circle at 42% 14%, rgba(248,202,103,0.9) 0%, rgba(248,202,103,0.52) 10%, transparent 22%),
          radial-gradient(circle at 70% 22%, rgba(248,202,103,0.84) 0%, rgba(248,202,103,0.4) 8%, transparent 18%),
          radial-gradient(circle at 44% 84%, rgba(33,79,206,0.78) 0%, rgba(33,79,206,0.36) 16%, transparent 34%),
          radial-gradient(circle at 72% 86%, rgba(33,79,206,0.78) 0%, rgba(33,79,206,0.3) 12%, transparent 26%),
          radial-gradient(circle at 50% 52%, rgba(11,11,13,1) 0%, rgba(11,11,13,0.96) 42%, rgba(11,11,13,0.48) 70%, rgba(255,255,255,0.2) 100%);
        box-shadow:
          inset 0 0 60px rgba(255,255,255,0.16),
          inset 0 -30px 120px rgba(0,0,0,0.9),
          0 0 0 2px rgba(255,255,255,0.05),
          0 20px 80px rgba(0,0,0,0.62),
          0 0 90px rgba(248,202,103,0.2);
        filter: saturate(1.2) contrast(1.05);
      }
      .liquid-orb::before,
      .liquid-orb::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
      }
      .liquid-orb::before {
        background:
          radial-gradient(circle at 12% 64%, rgba(255,255,255,0.94), transparent 14%),
          radial-gradient(circle at 88% 74%, rgba(255,255,255,0.9), transparent 14%);
        filter: blur(6px);
        opacity: 0.86;
      }
      .liquid-orb::after {
        border: 2px solid rgba(255,255,255,0.18);
        mask: linear-gradient(#000, transparent 70%);
      }
      .float-card {
        position: absolute;
        z-index: 2;
        min-width: 150px;
        padding: 16px 18px;
        border-radius: 18px;
        background: rgba(27,29,34,0.62);
        border: 1px solid rgba(255,255,255,0.08);
        backdrop-filter: blur(12px);
        box-shadow: 0 14px 34px rgba(0,0,0,0.3);
      }
      .float-card.left {
        left: 16%;
        bottom: 118px;
      }
      .float-card.right {
        right: 15%;
        bottom: 84px;
      }
      .float-card .metric {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        color: rgba(255,255,255,0.52);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .float-card strong {
        display: block;
        margin-bottom: 3px;
        font-size: 28px;
        line-height: 1;
      }
      .float-card p {
        margin: 0;
        color: rgba(255,255,255,0.92);
        font-size: 13px;
        line-height: 1.35;
      }
      .meter {
        width: 64px;
        height: 2px;
        margin-top: 12px;
        background: rgba(255,255,255,0.22);
        position: relative;
        overflow: hidden;
      }
      .meter::after {
        content: "";
        position: absolute;
        inset: 0;
        width: 72%;
        background: #ffffff;
      }
      .section-panel {
        margin-top: 28px;
        padding: 28px;
      }
      .panel-heading {
        width: min(840px, 100%);
        margin-bottom: 22px;
      }
      .panel-heading h2 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.02;
        letter-spacing: -0.05em;
      }
      .panel-heading p {
        margin: 14px 0 0;
        color: var(--muted);
      }
      .recognition-strip {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .recognition-pill {
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.84);
        font-size: 12px;
      }
      .insight-grid,
      .recommendation-grid,
      .case-grid,
      .service-detail-grid,
      .badge-grid {
        display: grid;
        gap: 18px;
      }
      .insight-grid {
        grid-template-columns: 1.05fr 0.95fr;
        align-items: center;
      }
      .insight-media {
        min-height: 380px;
        border-radius: 26px;
        background:
          linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
          url("${escapeHtml(research.insightImage)}") center/cover no-repeat;
        border: 1px solid var(--line);
        overflow: hidden;
      }
      .insight-copy p,
      .content-card p,
      .service-detail li {
        color: var(--muted);
      }
      .pressure-list,
      .evidence-list,
      .service-detail-grid ul {
        margin: 0;
        padding-left: 20px;
      }
      .framing {
        margin-top: 18px;
        padding: 18px 20px;
        border-radius: 20px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.92);
      }
      .recommendation-grid,
      .case-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .content-card {
        padding: 22px;
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
        border: 1px solid rgba(255,255,255,0.06);
      }
      .content-card h3,
      .service-detail h3 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: 25px;
        line-height: 1.05;
        letter-spacing: -0.04em;
      }
      .content-card h3 {
        margin-bottom: 10px;
      }
      .service-detail {
        margin-top: 18px;
      }
      .service-detail-header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
      }
      .timeline {
        display: inline-flex;
        align-items: center;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.92);
        font-size: 12px;
        font-weight: 600;
      }
      .service-detail-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .badge-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .badge-grid li {
        padding: 18px;
        border-radius: 18px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.9);
      }
      .cta-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 24px;
        border-radius: 24px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .cta-panel h2 {
        margin: 0;
        font-family: "Sora", sans-serif;
        font-size: clamp(28px, 4vw, 40px);
        line-height: 1.02;
        letter-spacing: -0.05em;
      }
      .cta-panel p {
        margin: 12px 0 0;
        color: var(--muted);
      }
      .cta-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 210px;
        padding: 14px 22px;
        border-radius: 999px;
        background: #ffffff;
        color: #0a0c11;
        font-size: 14px;
        font-weight: 700;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
        margin-top: 18px;
        color: var(--muted);
        font-size: 13px;
      }
      .footer-brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .footer-links {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      @media (max-width: 1040px) {
        .top-nav {
          grid-template-columns: 1fr;
          justify-items: start;
        }
        .nav-links,
        .nav-actions {
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 14px;
        }
        .float-card.left {
          left: 8%;
        }
        .float-card.right {
          right: 8%;
        }
        .insight-grid,
        .recommendation-grid,
        .case-grid,
        .service-detail-grid,
        .badge-grid,
        .cta-panel {
          grid-template-columns: 1fr;
        }
        .service-detail-header {
          align-items: start;
          flex-direction: column;
        }
      }
      @media (max-width: 720px) {
        .hero-stage {
          min-height: 780px;
        }
        .page-shell {
          padding: 24px 12px 56px;
        }
        .hero-inner,
        .section-panel {
          padding: 18px 16px 22px;
        }
        .hero-copy {
          margin-top: 34px;
        }
        .liquid-zone {
          height: 320px;
        }
        .liquid-orb {
          width: 92%;
          height: 260px;
          bottom: -42px;
        }
        .float-card {
          min-width: 132px;
          padding: 14px;
        }
        .float-card.left {
          left: 2%;
          bottom: 110px;
        }
        .float-card.right {
          right: 2%;
          bottom: 78px;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <section class="hero-stage">
        <div class="hero-inner">
          <div class="top-nav">
            ${renderWordmark()}
            <nav class="nav-links" aria-label="Primary">
              <a href="#understanding">About</a>
              <a href="#recommendations">Services</a>
              <a href="#stories">Stories</a>
              <a href="#contact">Contact</a>
              <a href="#faq">FAQ</a>
            </nav>
            <div class="nav-actions">
              <span class="nav-ghost">${escapeHtml(brand.location)}</span>
              <a class="nav-solid" href="#contact">Book Intro</a>
            </div>
          </div>

          <div class="hero-copy">
            <p class="greeting">${escapeHtml(greeting)}</p>
            <h1>${escapeHtml(research.heroTitle)}</h1>
            <p class="hero-subhead">${escapeHtml(research.subhead)}</p>
            <a class="hero-cta" href="#contact">Start the Conversation</a>
          </div>

          <div class="liquid-zone" aria-hidden="true">
            <div class="float-card left">
              <div class="metric">
                <span>Priority Signal</span>
                <span>↗</span>
              </div>
              <p>${escapeHtml(research.pressures[0] || "Modernization pressure is rising.")}</p>
              <div class="meter"></div>
            </div>
            <div class="float-card right">
              <div class="metric">
                <span>ABM Fit</span>
                <span>↗</span>
              </div>
              <strong>96%</strong>
              <p>High match for a targeted Spot.AI modernization conversation.</p>
              <div class="meter"></div>
            </div>
            <div class="liquid-orb"></div>
          </div>
        </div>
      </section>

      <section class="section-panel">
        <div class="recognition-strip">
          <span class="recognition-pill">Spot.AI</span>
          <span class="recognition-pill">${escapeHtml(brand.location)}</span>
          <span class="recognition-pill">AI Strategy</span>
          <span class="recognition-pill">Cloud + Product Engineering</span>
        </div>
        <p style="margin:0;color:var(--muted);">${escapeHtml(recognition)}</p>
      </section>

      <section id="understanding" class="section-panel">
        <div class="panel-heading">
          <p class="mini-label">Our Understanding of ${escapeHtml(research.companyName)}</p>
          <h2>What we see in ${escapeHtml(research.industryLabel.toLowerCase())} right now</h2>
          <p>${escapeHtml(research.summary)}</p>
        </div>
        <div class="insight-grid">
          <div class="insight-media"></div>
          <div class="insight-copy">
            <ul class="pressure-list">${renderList(research.pressures)}</ul>
            ${research.evidence?.length ? `<p class="mini-label" style="margin-top:18px;">Signals from your site</p><ul class="evidence-list">${researchEvidence}</ul>` : ""}
            <div class="framing">${escapeHtml(research.framing)}</div>
          </div>
        </div>
      </section>

      <section id="recommendations" class="section-panel">
        <div class="panel-heading">
          <p class="mini-label">Our Recommendation</p>
          <h2>Priority initiatives we recommend for ${escapeHtml(research.companyName)}</h2>
          <p>${escapeHtml(recommendationIntro)}</p>
        </div>
        <div class="recommendation-grid">${renderRecommendationCards(services)}</div>
      </section>

      <section class="section-panel">
        <div class="panel-heading">
          <p class="mini-label">Service Detail</p>
          <h2>How Spot.AI would shape the work</h2>
        </div>
        ${renderServiceDetails(services)}
      </section>

      <section class="section-panel">
        <div class="panel-heading">
          <p class="mini-label">Why Spot.AI</p>
          <h2>Built for modern teams that want sharp thinking and practical delivery</h2>
          <p>${escapeHtml(brand.footerBlurb)}</p>
        </div>
        <ul class="badge-grid">${trustBadgeHtml}</ul>
      </section>

      <section id="stories" class="section-panel">
        <div class="panel-heading">
          <p class="mini-label">Success Stories</p>
          <h2>Examples aligned to your priorities</h2>
          <p>These examples show the kinds of outcomes Spot.AI is designed to support when visibility, modernization, and execution need to move together.</p>
        </div>
        <div class="case-grid">${renderCaseStudies(research.caseStudies)}</div>
      </section>

      <section id="contact" class="section-panel">
        <div class="cta-panel">
          <div>
            <p class="mini-label">Let's Start the Conversation</p>
            <h2>${escapeHtml(ctaText)}</h2>
            <p>${escapeHtml(ctaSubtext)}</p>
          </div>
          <a class="cta-button" href="#">Book Intro Call</a>
        </div>
        <div class="footer">
          <div class="footer-brand">
            ${renderWordmark()}
            <span>${escapeHtml(brand.footerBlurb)}</span>
          </div>
          <div class="footer-links">
            ${brand.footerLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
          </div>
        </div>
      </section>
    </div>
  </body>
</html>`;
}
