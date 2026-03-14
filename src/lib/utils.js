export function normalizeUrl(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Please enter a company URL.");
  }

  const value = input.trim();
  const candidate = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    return url.toString();
  } catch {
    throw new Error("Please enter a valid company URL.");
  }
}

export function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function titleCase(input) {
  return String(input || "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function summarizeText(input, maxLength = 240) {
  const plain = String(input || "").replace(/\s+/g, " ").trim();
  if (!plain) {
    return "";
  }
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export function pickTopItems(list, count = 3) {
  return Array.from(new Set((list || []).filter(Boolean))).slice(0, count);
}
