import * as cheerio from "cheerio";
import { getIndustryProfile, industryProfiles } from "../data/industryProfiles.js";
import { normalizeUrl, pickTopItems, summarizeText, titleCase } from "../lib/utils.js";

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 SpotAILandingPageCreator/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractUsefulText(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() || "";
  const headings = $("h1, h2").map((_, el) => $(el).text().trim()).get();
  const paragraphs = $("p").map((_, el) => $(el).text().trim()).get();
  const links = $("a[href]").map((_, el) => ({
    href: $(el).attr("href"),
    text: $(el).text().trim()
  })).get();

  return {
    title,
    description,
    headings: pickTopItems(headings, 8),
    paragraphs: pickTopItems(paragraphs.filter((entry) => entry.length > 50), 8),
    links
  };
}

function resolveUrl(baseUrl, href) {
  if (!href) {
    return null;
  }

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function detectIndustry(textBlob) {
  const haystack = textBlob.toLowerCase();
  let best = { id: "general", score: 0 };

  for (const profile of industryProfiles) {
    const score = profile.keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0);
    if (score > best.score) {
      best = { id: profile.id, score };
    }
  }

  return best.id;
}

function inferCompanyName(url, title) {
  if (title) {
    const firstChunk = title.split(/[|\-–]/)[0].trim();
    if (firstChunk.length >= 3) {
      return firstChunk;
    }
  }

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const root = hostname.split(".")[0];
    return titleCase(root);
  } catch {
    return "Your Team";
  }
}

function inferCompanySize(text) {
  const haystack = text.toLowerCase();

  if (haystack.includes("global") || haystack.includes("worldwide") || haystack.includes("enterprise")) {
    return "enterprise or multi-region organization";
  }
  if (haystack.includes("mid-market") || haystack.includes("mid market")) {
    return "mid-market organization";
  }
  if (haystack.includes("family-owned") || haystack.includes("local")) {
    return "growing regional organization";
  }

  return "growth-focused mid-market to enterprise organization";
}

function buildFallbackResearch(companyUrl, reason = "unavailable") {
  const companyName = inferCompanyName(companyUrl, "");
  const profile = getIndustryProfile("general");

  return {
    companyName,
    companyUrl,
    domain: new URL(companyUrl).hostname,
    pageTitle: "",
    description: "",
    summary: `${companyName} appears to have a limited publicly scrapeable web footprint right now, so this draft uses Spot.AI's general positioning and should be refined after a quick manual review.`,
    industryId: profile.id,
    industryLabel: profile.label,
    companySize: "growth-focused organization",
    pressures: profile.pressures,
    framing: profile.framing,
    heroImage: profile.heroImage,
    insightImage: profile.insightImage,
    heroTitle: profile.heroTitle,
    subhead: profile.subhead,
    caseStudies: profile.caseStudies,
    evidence: [],
    researchMode: "fallback",
    researchReason: reason
  };
}

function selectSupportingPages(baseUrl, links) {
  const candidates = [];
  const patterns = ["about", "company", "solutions", "services", "industries", "products"];

  for (const link of links) {
    const href = link.href || "";
    const text = (link.text || "").toLowerCase();
    const value = href.toLowerCase();

    if (patterns.some((pattern) => value.includes(pattern) || text.includes(pattern))) {
      const resolved = resolveUrl(baseUrl, href);
      if (resolved && resolved.startsWith(new URL(baseUrl).origin)) {
        candidates.push(resolved);
      }
    }
  }

  return pickTopItems(candidates, 2);
}

export async function researchCompany(inputUrl) {
  const companyUrl = normalizeUrl(inputUrl);
  let homepageHtml;

  try {
    homepageHtml = await fetchText(companyUrl);
  } catch (error) {
    return buildFallbackResearch(companyUrl, error.message || "homepage_fetch_failed");
  }

  const homepage = extractUsefulText(homepageHtml);
  const supportingPages = selectSupportingPages(companyUrl, homepage.links);

  const supportingTexts = [];
  for (const pageUrl of supportingPages) {
    try {
      const html = await fetchText(pageUrl);
      const extracted = extractUsefulText(html);
      supportingTexts.push(extracted);
    } catch {
      // Supporting pages are optional; the homepage remains the primary source.
    }
  }

  const textParts = [
    homepage.title,
    homepage.description,
    ...homepage.headings,
    ...homepage.paragraphs,
    ...supportingTexts.flatMap((entry) => [entry.title, entry.description, ...entry.headings, ...entry.paragraphs])
  ].filter(Boolean);

  const combinedText = textParts.join(" ");
  const industryId = detectIndustry(combinedText);
  const profile = getIndustryProfile(industryId);
  const companyName = inferCompanyName(companyUrl, homepage.title);
  const size = inferCompanySize(combinedText);
  const summary = summarizeText(homepage.description || homepage.paragraphs[0] || homepage.headings[0] || `${companyName} appears to operate in ${profile.label}.`, 220);

  return {
    companyName,
    companyUrl,
    domain: new URL(companyUrl).hostname,
    pageTitle: homepage.title,
    description: homepage.description,
    summary,
    industryId,
    industryLabel: profile.label,
    companySize: size,
    pressures: profile.pressures,
    framing: profile.framing,
    heroImage: profile.heroImage,
    insightImage: profile.insightImage,
    heroTitle: profile.heroTitle,
    subhead: profile.subhead,
    caseStudies: profile.caseStudies,
    researchMode: "live",
    researchReason: null,
    evidence: pickTopItems([
      homepage.headings[0],
      homepage.headings[1],
      homepage.paragraphs[0],
      homepage.paragraphs[1]
    ], 3)
  };
}
