import dotenv from "dotenv";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { confirmEmail, requireAuth, isAuthenticated } from "./lib/auth.js";
import apiRouter from "./routes/api.js";
import publicRouter from "./routes/public.js";
import { attachVoiceAgentServer } from "./services/booking/voiceAgent.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    provider: process.env.PUBLISH_PROVIDER || "local-json"
  });
});

app.use("/api/public", publicRouter);
app.use("/api", apiRouter);

app.get("/login", async (req, res) => {
  if (await isAuthenticated(req, res)) {
    res.redirect("/");
    return;
  }

  res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/reset-password", (_req, res) => {
  res.sendFile(path.join(publicDir, "reset-password.html"));
});

app.get("/auth/confirm", confirmEmail);

app.use(requireAuth);

app.use(express.static(publicDir, {
  index: false
}));

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const server = http.createServer(app);

attachVoiceAgentServer(server);

server.listen(port, host, () => {
  console.log(`Spot.AI Landing Page Lab running at http://${host}:${port}`);
});
