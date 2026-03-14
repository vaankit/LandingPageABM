function buildHeaders() {
  const token = process.env.PUBLISH_API_TOKEN;
  const headerName = process.env.PUBLISH_API_AUTH_HEADER || "Authorization";
  const scheme = process.env.PUBLISH_API_AUTH_SCHEME || "Bearer";

  if (!token) {
    throw new Error("PUBLISH_API_TOKEN is missing for the http-json publisher.");
  }

  return {
    "content-type": "application/json",
    [headerName]: scheme ? `${scheme} ${token}` : token
  };
}

export async function publishToHttpJson(page) {
  const endpoint = process.env.PUBLISH_API_URL;

  if (!endpoint) {
    throw new Error("PUBLISH_API_URL is missing for the http-json publisher.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: buildHeaders(),
      body: JSON.stringify({
      project: process.env.PUBLISH_PROJECT_NAME || "Spot.AI Landing Pages",
      page: page.pageModel,
      previewHtml: page.previewHtml
    })
  });

  const text = await response.text();
  let parsed;

  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || `Publish failed with ${response.status}`);
  }

  return {
    provider: "http-json",
    status: "published",
    response: parsed
  };
}
