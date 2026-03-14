import express from "express";
import { serviceCatalog } from "../data/serviceCatalog.js";
import { getAuthenticatedUser, isAuthenticated, login, logout, resendConfirmation, signup } from "../lib/auth.js";
import { researchCompany } from "../services/companyResearch.js";
import { composeLandingPage } from "../services/pageComposer.js";
import { publishDraft } from "../services/publishers/index.js";

const router = express.Router();

router.get("/auth/status", async (req, res) => {
  const authenticated = await isAuthenticated(req, res);
  const user = authenticated ? await getAuthenticatedUser(req, res) : null;

  res.json({
    authenticated,
    user: user ? {
      id: user.id,
      email: user.email
    } : null
  });
});

router.post("/auth/login", login);
router.post("/auth/signup", signup);
router.post("/auth/resend-confirmation", resendConfirmation);
router.post("/auth/logout", logout);

router.use(async (req, res, next) => {
  if (await isAuthenticated(req, res)) {
    next();
    return;
  }

  res.status(401).json({ error: "Authentication required." });
});

router.get("/services", (_req, res) => {
  res.json({ services: serviceCatalog });
});

router.post("/research-company", async (req, res) => {
  try {
    const { companyUrl } = req.body;
    const research = await researchCompany(companyUrl);
    res.json({ research });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Unable to research company."
    });
  }
});

router.post("/generate-page", async (req, res) => {
  try {
    const { companyUrl, contactName, contactTitle, recommendedServices } = req.body;
    const research = await researchCompany(companyUrl);
    const page = await composeLandingPage({
      companyUrl,
      contactName,
      contactTitle,
      recommendedServices,
      research
    });

    res.json({ page, research });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Unable to generate page."
    });
  }
});

router.post("/publish", async (req, res) => {
  try {
    const { companyUrl, contactName, contactTitle, recommendedServices } = req.body;
    const research = await researchCompany(companyUrl);
    const page = await composeLandingPage({
      companyUrl,
      contactName,
      contactTitle,
      recommendedServices,
      research
    });
    const publication = await publishDraft(page);

    res.json({
      page,
      research,
      publication
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Unable to publish page."
    });
  }
});

export default router;
