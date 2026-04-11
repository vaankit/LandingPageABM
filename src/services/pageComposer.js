import { getServicesByIds, serviceCatalog } from "../data/serviceCatalog.js";
import { brandProfile } from "../data/brandProfile.js";
import { renderLandingPageHtml } from "../lib/html.js";
import { slugify } from "../lib/utils.js";
import { generateAbmNarrative } from "./ollamaContent.js";

const MAX_SELECTED_SERVICES = 4;

function buildGreeting(contactName, contactTitle) {
  if (contactName && contactTitle) {
    return `Hi ${contactName}, as ${contactTitle} you are likely balancing growth priorities with the need for clearer operational control.`;
  }
  if (contactName) {
    return `Hi ${contactName}, we put this page together with your team and business context in mind.`;
  }
  return "We put this page together with your team and business context in mind.";
}

function defaultServices(serviceIds) {
  const selected = getServicesByIds(serviceIds);
  if (selected.length >= 1) {
    return selected.slice(0, MAX_SELECTED_SERVICES);
  }
  return serviceCatalog.slice(0, MAX_SELECTED_SERVICES);
}

function buildDeterministicNarrative(research, services) {
  return {
    heroTitle: research.heroTitle,
    subhead: research.subhead,
    understandingSummary: research.summary,
    pressures: research.pressures,
    framing: research.framing,
    recommendationIntro: "We selected these services because they align with the audience signals, campaign opportunities, and messaging priorities visible from your current footprint.",
    ctaText: `Let's explore which marketing workflows could create the fastest lift for ${research.companyName}.`,
    ctaSubtext: "Bring the campaign goals you are balancing right now. Spot.AI will bring practical ideas across content generation, email execution, planning, and faster iteration.",
    recommendationCards: services.map((service) => ({
      serviceId: service.id,
      cardTitle: service.cardTitle,
      cardSummary: service.cardSummary
    }))
  };
}

function mergeServicesWithNarrative(services, narrative) {
  const cardById = new Map((narrative.recommendationCards || []).map((card) => [card.serviceId, card]));

  return services.map((service) => {
    const card = cardById.get(service.id);
    if (!card) {
      return service;
    }

    return {
      ...service,
      cardTitle: card.cardTitle || service.cardTitle,
      cardSummary: card.cardSummary || service.cardSummary
    };
  });
}

export async function composeLandingPage({
  companyUrl,
  contactName,
  contactTitle,
  recommendedServices,
  research
}) {
  const baseServices = defaultServices(recommendedServices);
  const fallbackNarrative = buildDeterministicNarrative(research, baseServices);
  const narrative = await generateAbmNarrative({
    contactName,
    contactTitle,
    research,
    services: baseServices,
    fallbackNarrative
  });
  const services = mergeServicesWithNarrative(baseServices, narrative);
  const mergedResearch = {
    ...research,
    heroTitle: narrative.heroTitle || research.heroTitle,
    subhead: narrative.subhead || research.subhead,
    summary: narrative.understandingSummary || research.summary,
    pressures: narrative.pressures?.length ? narrative.pressures.slice(0, 3) : research.pressures,
    framing: narrative.framing || research.framing
  };
  const pageName = `${brandProfile.pageTitlePrefix} x ${research.companyName} ABM Landing Page`;
  const slug = slugify(`${research.companyName}-${research.industryId}-abm`);

  const page = {
    pageName,
    slug,
    companyUrl,
    greeting: buildGreeting(contactName, contactTitle),
    ctaText: narrative.ctaText || fallbackNarrative.ctaText,
    ctaSubtext: narrative.ctaSubtext || fallbackNarrative.ctaSubtext,
    recognition: brandProfile.recognitionText,
    trustBadges: brandProfile.trustBadges,
    brand: brandProfile,
    recommendationIntro: narrative.recommendationIntro || fallbackNarrative.recommendationIntro,
    research: mergedResearch,
    services,
    pageModel: {
      name: pageName,
      slug,
      status: "draft",
      brand: brandProfile.name,
      audience: {
        companyName: research.companyName,
        contactName: contactName || "",
        contactTitle: contactTitle || "",
        companyUrl
      },
      sections: [
        { id: "hero", type: "hero", content: { greeting: buildGreeting(contactName, contactTitle), headline: mergedResearch.heroTitle, subhead: mergedResearch.subhead } },
        { id: "recognition", type: "recognition", content: { text: brandProfile.recognitionText } },
        { id: "understanding", type: "understanding", content: { summary: mergedResearch.summary, pressures: mergedResearch.pressures, framing: mergedResearch.framing } },
        { id: "recommendations", type: "recommendations", content: { services: services.map((service) => service.id) } },
        { id: "service-details", type: "service-details", content: services },
        { id: "why-spot-ai", type: "badges", content: brandProfile.trustBadges },
        { id: "case-studies", type: "case-studies", content: research.caseStudies },
        { id: "cta", type: "cta", content: { headline: `Let's Start the Conversation`, body: "Connect with Spot.AI to review campaign priorities, workflow opportunities, and the fastest next steps." } }
      ]
    }
  };

  page.previewHtml = renderLandingPageHtml(page);
  return page;
}
