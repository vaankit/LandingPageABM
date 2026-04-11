import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { summarizeText } from "../../lib/utils.js";
import { reserveCalendarSlot, suggestAlternativeSlots, isCalendarConfigured } from "./calendar.js";
import { notifyBookingOwner } from "./notifications.js";
import { saveBookingRequest, updateBookingRequest } from "./store.js";
import { isVoiceAgentConfigured, triggerOutboundBookingCall } from "./voiceAgent.js";

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

function trimValue(value, maxLength = 240) {
  return summarizeText(String(value || "").trim(), maxLength);
}

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/[^\d+]/g, "");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+?[1-9]\d{7,14}$/.test(phone);
}

function bookingIntentLabel(intent) {
  return intent === "intro-call" ? "Book Intro Call" : "Book a Demo";
}

function bookingDurationMinutes() {
  const parsed = Number.parseInt(env("BOOKING_DURATION_MINUTES", "30"), 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function buildPreferredDateTimeDisplay(preferredDateTimeIso, timeZone) {
  const dateTime = DateTime.fromISO(preferredDateTimeIso, { setZone: true });
  if (!dateTime.isValid) {
    return "";
  }

  return dateTime.setZone(timeZone || "UTC").toFormat("ccc d LLL, h:mm a ZZZZ");
}

function validateBookingPayload(payload) {
  const fullName = trimValue(payload.fullName, 120);
  const workEmail = trimValue(payload.workEmail, 180).toLowerCase();
  const phone = normalizePhone(payload.phone);
  const intent = payload.intent === "intro-call" ? "intro-call" : "demo";
  const preferredDateTimeIso = String(payload.preferredDateTimeIso || "").trim();
  const timeZone = trimValue(payload.timeZone, 80) || "UTC";

  if (!fullName) {
    throw new Error("Please enter your name.");
  }

  if (!workEmail || !validateEmail(workEmail)) {
    throw new Error("Please enter a valid work email.");
  }

  if (!preferredDateTimeIso || !DateTime.fromISO(preferredDateTimeIso, { setZone: true }).isValid) {
    throw new Error("Please choose a valid preferred date and time.");
  }

  const requestCallback = payload.requestCallback === true || payload.requestCallback === "true";
  if (requestCallback && (!phone || !validatePhone(phone))) {
    throw new Error("Please enter a valid phone number for a callback.");
  }

  return {
    intent,
    intentLabel: bookingIntentLabel(intent),
    fullName,
    workEmail,
    phone,
    companyName: trimValue(payload.companyName, 160),
    preferredDateTimeIso,
    preferredDateTimeDisplay: buildPreferredDateTimeDisplay(preferredDateTimeIso, timeZone),
    timeZone,
    notes: trimValue(payload.notes, 800),
    requestCallback,
    sourcePageTitle: trimValue(payload.sourcePageTitle, 180),
    sourcePageUrl: trimValue(payload.sourcePageUrl, 240),
    requestedServices: Array.isArray(payload.requestedServices)
      ? payload.requestedServices.map((service) => trimValue(service, 120)).filter(Boolean).slice(0, 8)
      : [],
    durationMinutes: bookingDurationMinutes()
  };
}

function buildNotificationPayload({ booking, calendar, voiceCall, requestMeta }) {
  return {
    type: "spot-ai.booking-request",
    booking: {
      id: booking.id,
      intent: booking.intent,
      intentLabel: booking.intentLabel,
      fullName: booking.fullName,
      workEmail: booking.workEmail,
      phone: booking.phone,
      companyName: booking.companyName,
      preferredDateTimeIso: booking.preferredDateTimeIso,
      preferredDateTimeDisplay: booking.preferredDateTimeDisplay,
      timeZone: booking.timeZone,
      requestCallback: booking.requestCallback,
      notes: booking.notes,
      requestedServices: booking.requestedServices,
      sourcePageTitle: booking.sourcePageTitle,
      sourcePageUrl: booking.sourcePageUrl
    },
    calendar,
    voiceCall,
    requestMeta
  };
}

export function getBookingSystemStatus() {
  return {
    calendarConfigured: isCalendarConfigured(),
    voiceAgentConfigured: isVoiceAgentConfigured(),
    notificationWebhookConfigured: Boolean(env("BOOKING_NOTIFICATION_WEBHOOK_URL"))
  };
}

export async function createBookingRequest(payload, requestMeta = {}) {
  const validated = validateBookingPayload(payload);
  const booking = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "received",
    ...validated,
    ip: requestMeta.ip || "",
    userAgent: trimValue(requestMeta.userAgent, 240),
    history: []
  };

  await saveBookingRequest(booking);

  const calendar = await reserveCalendarSlot(booking);
  if (calendar.status === "busy") {
    await updateBookingRequest(booking.id, {
      status: "needs-reschedule",
      calendar
    }, "calendar.busy", { suggestions: calendar.suggestions });

    return {
      bookingId: booking.id,
      status: "needs-reschedule",
      suggestions: calendar.suggestions
    };
  }

  let persistedBooking = booking;
  if (calendar.status === "confirmed") {
    persistedBooking = await updateBookingRequest(booking.id, {
      status: "scheduled",
      calendarEvent: calendar.event
    }, "calendar.confirmed", calendar.event);
  } else {
    persistedBooking = await updateBookingRequest(booking.id, {
      status: "pending-review",
      calendar
    }, "calendar.skipped", calendar);
  }

  let voiceCall = {
    status: "skipped",
    reason: booking.requestCallback ? "voice-agent-not-configured" : "callback-not-requested"
  };

  if (booking.requestCallback) {
    try {
      voiceCall = await triggerOutboundBookingCall(persistedBooking);
      if (voiceCall.status === "queued") {
        persistedBooking = await updateBookingRequest(booking.id, {
          voiceCall: voiceCall.call
        }, "voice.queued", voiceCall.call);
      }
    } catch (error) {
      voiceCall = {
        status: "failed",
        error: error.message
      };
      await updateBookingRequest(booking.id, {
        voiceCall
      }, "voice.failed", voiceCall);
    }
  }

  let notification = {
    status: "skipped",
    reason: "notification-webhook-not-configured"
  };

  try {
    notification = await notifyBookingOwner(buildNotificationPayload({
      booking: persistedBooking,
      calendar,
      voiceCall,
      requestMeta
    }));
  } catch (error) {
    notification = {
      status: "failed",
      error: error.message
    };
    await updateBookingRequest(booking.id, {
      notification
    }, "notification.failed", notification);
  }

  if (notification.status === "sent") {
    await updateBookingRequest(booking.id, {
      notification
    }, "notification.sent", { status: "sent" });
  }

  return {
    bookingId: booking.id,
    status: persistedBooking.status,
    calendar,
    voiceCall,
    notification
  };
}

export async function getRescheduleSuggestions(preferredDateTimeIso, timeZone) {
  return suggestAlternativeSlots({
    requestedStartIso: preferredDateTimeIso,
    timeZone,
    durationMinutes: bookingDurationMinutes()
  });
}
