import { publishToLocalJson } from "./localJsonPublisher.js";
import { publishToHttpJson } from "./httpJsonPublisher.js";

export async function publishDraft(page) {
  const provider = process.env.PUBLISH_PROVIDER || "local-json";

  if (provider === "http-json") {
    return publishToHttpJson(page);
  }

  return publishToLocalJson(page);
}
