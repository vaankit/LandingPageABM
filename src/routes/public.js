import express from "express";
import { createBookingRequest, getBookingSystemStatus } from "../services/booking/index.js";
import { getBookingRequest, updateBookingRequest } from "../services/booking/store.js";
import { buildVoiceTwiML } from "../services/booking/voiceAgent.js";

const router = express.Router();
const requestCounts = new Map();

function trim(value) {
  return String(value || "").trim();
}

function getAllowedOrigins() {
  const configured = trim(process.env.PUBLIC_BOOKING_ALLOWED_ORIGINS || "*");
  if (configured === "*") {
    return { allowAll: true, values: [] };
  }

  const values = configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const appUrl = trim(process.env.APP_URL);
  const publicBaseUrl = trim(process.env.PUBLIC_BASE_URL);

  if (appUrl) {
    values.push(new URL(appUrl).origin);
  }

  if (publicBaseUrl) {
    values.push(new URL(publicBaseUrl).origin);
  }

  return {
    allowAll: false,
    values: Array.from(new Set(values))
  };
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.allowAll) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && allowedOrigins.values.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

function rateLimitBookingRequests(req, res, next) {
  const windowMs = Number.parseInt(String(process.env.BOOKING_RATE_LIMIT_WINDOW_MS || "900000"), 10);
  const maxRequests = Number.parseInt(String(process.env.BOOKING_RATE_LIMIT_MAX || "10"), 10);
  const ip = trim(req.ip || req.headers["x-forwarded-for"] || "unknown");
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, {
      count: 1,
      resetAt: now + windowMs
    });
    next();
    return;
  }

  if (entry.count >= maxRequests) {
    res.status(429).json({
      error: "Too many booking requests. Please wait a few minutes and try again."
    });
    return;
  }

  entry.count += 1;
  requestCounts.set(ip, entry);
  next();
}

router.use((req, res, next) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    booking: getBookingSystemStatus()
  });
});

router.post("/booking/request", rateLimitBookingRequests, async (req, res) => {
  try {
    const result = await createBookingRequest(req.body, {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
      submittedAt: new Date().toISOString()
    });

    if (result.status === "needs-reschedule") {
      res.status(409).json({
        error: "That preferred day is no longer available. Please choose another date.",
        bookingId: result.bookingId,
        suggestions: result.suggestions || []
      });
      return;
    }

    res.status(201).json({
      ok: true,
      bookingId: result.bookingId,
      status: result.status,
      calendar: result.calendar,
      voiceCall: result.voiceCall,
      notification: result.notification
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Unable to process the booking request."
    });
  }
});

router.all("/voice/twiml", (req, res) => {
  const bookingId = trim(req.query.bookingId || req.body?.bookingId);
  const booking = bookingId ? getBookingRequest(bookingId) : null;

  res.type("text/xml");
  res.send(buildVoiceTwiML(booking));
});

router.post("/voice/status", async (req, res) => {
  const bookingId = trim(req.query.bookingId);
  if (bookingId) {
    await updateBookingRequest(bookingId, {
      callStatus: {
        sid: trim(req.body.CallSid),
        status: trim(req.body.CallStatus),
        duration: trim(req.body.CallDuration),
        answeredBy: trim(req.body.AnsweredBy)
      }
    }, "voice.status", {
      sid: trim(req.body.CallSid),
      status: trim(req.body.CallStatus),
      duration: trim(req.body.CallDuration),
      answeredBy: trim(req.body.AnsweredBy)
    });
  }

  res.sendStatus(204);
});

export default router;
