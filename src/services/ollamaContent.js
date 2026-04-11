import { brandProfile } from "../data/brandProfile.js";

function safeJsonParse(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function extractJsonObject(input) {
  const text = String(input || "").trim();
  if (!text) {
    return null;
  }

  const direct = safeJsonParse(text);
  if (direct) {
    return direct;
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return safeJsonParse(text.slice(start, end + 1));
}

function buildPrompt({ contactName, contactTitle, research, services, fallbackNarrative }) {
  const selectedServices = services.map((service) => ({
    serviceId: service.id,
    name: service.name,
    cardTitle: service.cardTitle,
    cardSummary: service.cardSummary
  }));

  return `
You are writing concise, executive-friendly ABM landing page copy for ${brandProfile.name}.

Company context:
${JSON.stringify({
  companyName: research.companyName,
  companyUrl: research.companyUrl,
  industry: research.industryLabel,
  companySize: research.companySize,
  summary: research.summary,
  pressures: research.pressures,
  evidence: research.evidence,
  researchMode: research.researchMode,
  researchReason: research.researchReason
}, null, 2)}

Contact context:
${JSON.stringify({
  contactName: contactName || "",
  contactTitle: contactTitle || ""
}, null, 2)}

Selected services:
${JSON.stringify(selectedServices, null, 2)}

Brand facts:
- Brand: ${brandProfile.name}
- Based in ${brandProfile.location}
- Positioning: ${brandProfile.tagline}
- Operator profile: ${brandProfile.operatorTitle}
- Strengths: realtime marketing material generation, realtime email generation, holiday-aware campaign planning, and on-demand marketing assistance
- Tone: modern, sharp, practical, and future-facing

Fallback copy baseline:
${JSON.stringify(fallbackNarrative, null, 2)}

Return only valid JSON matching this exact shape:
{
  "heroTitle": "string",
  "subhead": "string",
  "understandingSummary": "string",
  "pressures": ["string", "string", "string"],
  "framing": "string",
  "recommendationIntro": "string",
  "ctaText": "string",
  "ctaSubtext": "string",
  "recommendationCards": [
    {
      "serviceId": "string",
      "cardTitle": "string",
      "cardSummary": "string"
    }
  ]
}

Rules:
- Keep the tone confident, specific, and consultative.
- Do not invent facts about the target company beyond the supplied context.
- If researchMode is "fallback", avoid pretending the website was deeply researched.
- Keep heroTitle under 18 words.
- Keep subhead under 28 words.
- Keep each pressure under 16 words.
- Keep each cardSummary under 24 words.
- Use modern international business English.
- No markdown, no code fences, JSON only.
`.trim();
}

function normalizeNarrative(raw, fallbackNarrative) {
  if (!raw || typeof raw !== "object") {
    return fallbackNarrative;
  }

  return {
    heroTitle: raw.heroTitle || fallbackNarrative.heroTitle,
    subhead: raw.subhead || fallbackNarrative.subhead,
    understandingSummary: raw.understandingSummary || fallbackNarrative.understandingSummary,
    pressures: Array.isArray(raw.pressures) && raw.pressures.length ? raw.pressures.filter(Boolean).slice(0, 3) : fallbackNarrative.pressures,
    framing: raw.framing || fallbackNarrative.framing,
    recommendationIntro: raw.recommendationIntro || fallbackNarrative.recommendationIntro,
    ctaText: raw.ctaText || fallbackNarrative.ctaText,
    ctaSubtext: raw.ctaSubtext || fallbackNarrative.ctaSubtext,
    recommendationCards: Array.isArray(raw.recommendationCards) && raw.recommendationCards.length ? raw.recommendationCards : fallbackNarrative.recommendationCards
  };
}

export async function generateAbmNarrative({
  contactName,
  contactTitle,
  research,
  services,
  fallbackNarrative
}) {
  if ((process.env.CONTENT_PROVIDER || "ollama") !== "ollama") {
    return fallbackNarrative;
  }

  const endpoint = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434/api/generate";
  const model = process.env.OLLAMA_MODEL || "gpt-oss:20b";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt: buildPrompt({
          contactName,
          contactTitle,
          research,
          services,
          fallbackNarrative
        }),
        stream: false,
        format: "json",
        options: {
          temperature: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}`);
    }

    const payload = await response.json();
    const parsed = extractJsonObject(payload.response);
    return normalizeNarrative(parsed, fallbackNarrative);
  } catch {
    return fallbackNarrative;
  }
}
